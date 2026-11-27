<?php
declare(strict_types=1);

/*
 * NR.EVO : envoi des formulaires (Contact et Composer mon pack) par le serveur du site.
 * Aucun service externe : le message part de ce fichier vers VOTRE boîte email,
 * et, pour le récapitulatif de pack, une copie part vers l'email du client.
 *
 * Ce fichier doit être sur un hébergement qui exécute PHP (OVH, o2switch, Hostinger, IONOS,
 * un serveur perso...). GitHub Pages n'exécute pas PHP : voir le README.
 */

// ====================== RÉGLAGES : seule cette partie est à modifier ======================
$CONFIG = [
    // Boîte qui reçoit tous les messages et tous les récapitulatifs.
    'team_email' => 'nr.evo.contact@gmail.com',

    // Nom affiché comme expéditeur.
    'from_name'  => 'NR.EVO',

    // Adresse expéditrice. Laisser vide : noreply@votre-domaine (convient à la plupart des hébergeurs).
    // Si vous utilisez le SMTP ci-dessous, mettre la même adresse que smtp_user.
    'from_email' => '',

    // --- Option SMTP (recommandé si les emails arrivent en spam avec la méthode simple) ---
    // Laisser smtp_host vide pour utiliser la fonction mail() de l'hébergeur.
    //
    // Exemple avec la boîte Gmail de NR.EVO (aucun domaine nécessaire) :
    //   smtp_host 'smtp.gmail.com', smtp_port 465, smtp_secure 'ssl',
    //   smtp_user 'nr.evo.contact@gmail.com', smtp_pass = « mot de passe d'application » Google (16 caractères).
    //   Il se crée sur myaccount.google.com > Sécurité > Validation en deux étapes > Mots de passe des applications.
    //
    // Exemple avec une boîte de votre hébergeur (contact@nrevo.fr) :
    //   smtp_host 'ssl0.ovh.net' (ou celui indiqué par l'hébergeur), smtp_port 465, smtp_secure 'ssl'.
    'smtp_host'   => '',
    'smtp_port'   => 465,
    'smtp_secure' => 'ssl',      // 'ssl' (port 465), 'tls' (port 587) ou '' (aucun)
    'smtp_user'   => '',
    'smtp_pass'   => '',

    // Anti-abus : nombre maximal d'envois par visiteur (adresse IP) sur la durée indiquée (secondes).
    'max_per_window' => 5,
    'window'         => 600,
];
// ===========================================================================================

// Secours si l'extension mbstring n'est pas installée sur l'hébergement.
if (!function_exists('mb_substr')) {
    function mb_substr(string $s, int $start, ?int $len = null): string
    {
        $chars = preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        return implode('', array_slice($chars, $start, $len));
    }
}
if (!function_exists('mb_strlen')) {
    function mb_strlen(string $s): int
    {
        return count(preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY) ?: []);
    }
}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out(bool $ok, string $error = '', int $code = 200): void
{
    http_response_code($code);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

function one_line($s, int $max): string
{
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', is_string($s) ? $s : '') ?? '';
    return trim(mb_substr($s, 0, $max));
}

function multi_line($s, int $max): string
{
    $s = str_replace(["\r\n", "\r"], "\n", is_string($s) ? $s : '');
    $s = preg_replace('/[^\P{C}\n\t]+/u', '', $s) ?? '';
    return trim(mb_substr($s, 0, $max));
}

function hdr(string $s): string
{
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

function host_only(string $h): string
{
    return strtolower(preg_replace('/:\d+$/', '', trim($h)) ?? '');
}

function rate_limited(array $c): bool
{
    $file = sys_get_temp_dir() . '/nrevo_rl_' . md5($_SERVER['REMOTE_ADDR'] ?? '?') . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return false;
    }
    flock($fh, LOCK_EX);
    $h = json_decode((string) stream_get_contents($fh), true);
    $now = time();
    $h = is_array($h) ? array_values(array_filter($h, fn($t) => is_int($t) && $t > $now - $c['window'])) : [];
    $limited = count($h) >= $c['max_per_window'];
    if (!$limited) {
        $h[] = $now;
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($h));
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $limited;
}

// ---------- envoi SMTP minimal (sans bibliothèque) ----------
function smtp_reply($fp): array
{
    $all = '';
    while (($line = fgets($fp, 1024)) !== false) {
        $all .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    return [(int) substr($all, 0, 3), trim($all)];
}

function smtp_cmd($fp, string $cmd, array $expect): void
{
    if ($cmd !== '') {
        fwrite($fp, $cmd . "\r\n");
    }
    [$code, $text] = smtp_reply($fp);
    if (!in_array($code, $expect, true)) {
        throw new RuntimeException('SMTP ' . ($cmd === '' ? 'connexion' : strtok($cmd, ' ')) . ' : ' . $text);
    }
}

function smtp_send(array $c, string $from, string $to, string $message): void
{
    $secure = $c['smtp_secure'];
    $fp = @stream_socket_client(($secure === 'ssl' ? 'ssl://' : 'tcp://') . $c['smtp_host'] . ':' . (int) $c['smtp_port'], $errno, $errstr, 15);
    if (!$fp) {
        throw new RuntimeException("SMTP connexion impossible : $errstr ($errno)");
    }
    stream_set_timeout($fp, 15);
    $me = preg_replace('/[^a-z0-9.-]/i', '', $_SERVER['SERVER_NAME'] ?? '') ?: 'localhost';
    try {
        smtp_cmd($fp, '', [220]);
        smtp_cmd($fp, "EHLO $me", [250]);
        if ($secure === 'tls') {
            smtp_cmd($fp, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('SMTP : échec du chiffrement TLS');
            }
            smtp_cmd($fp, "EHLO $me", [250]);
        }
        if ($c['smtp_user'] !== '') {
            smtp_cmd($fp, 'AUTH LOGIN', [334]);
            smtp_cmd($fp, base64_encode($c['smtp_user']), [334]);
            smtp_cmd($fp, base64_encode($c['smtp_pass']), [235]);
        }
        smtp_cmd($fp, "MAIL FROM:<$from>", [250]);
        smtp_cmd($fp, "RCPT TO:<$to>", [250, 251]);
        smtp_cmd($fp, 'DATA', [354]);
        fwrite($fp, $message . "\r\n.\r\n");
        smtp_cmd($fp, '', [250]);
        @fwrite($fp, "QUIT\r\n");
    } finally {
        fclose($fp);
    }
}

function send_mail(array $c, string $to, string $subject, string $body, string $replyTo = ''): void
{
    $from = $c['from_email'];
    $domain = substr(strrchr($from, '@'), 1);
    $headers = [
        'Date: ' . date('r'),
        'From: ' . hdr($c['from_name']) . ' <' . $from . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'Message-ID: <' . bin2hex(random_bytes(10)) . '@' . $domain . '>',
    ];
    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    $payload = chunk_split(base64_encode($body), 76, "\r\n");

    if ($c['smtp_host'] !== '') {
        $full = implode("\r\n", array_merge($headers, ['To: ' . $to, 'Subject: ' . hdr($subject)])) . "\r\n\r\n" . $payload;
        smtp_send($c, $from, $to, $full);
        return;
    }
    if (!mail($to, hdr($subject), $payload, implode("\r\n", $headers), '-f' . $from)) {
        throw new RuntimeException('mail() a refusé le message');
    }
}

// ================================ traitement de la demande ================================
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    out(false, 'méthode non autorisée', 405);
}
// Le formulaire doit venir du site lui-même.
if (!empty($_SERVER['HTTP_ORIGIN']) && host_only((string) parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST)) !== host_only($_SERVER['HTTP_HOST'] ?? '')) {
    out(false, 'origine non autorisée', 403);
}
$raw = file_get_contents('php://input', false, null, 0, 40001);
if ($raw === false || strlen($raw) > 40000) {
    out(false, 'demande trop volumineuse', 413);
}
$d = json_decode($raw, true);
if (!is_array($d)) {
    out(false, 'demande illisible', 400);
}
if (!empty($d['bot'])) {
    out(true); // robot : on répond « ok » sans rien envoyer
}

$type = $d['type'] ?? '';
$name = one_line($d['name'] ?? '', 120);
$email = one_line($d['email'] ?? '', 254);
$tel = one_line($d['tel'] ?? '', 40);
$msg = multi_line($d['msg'] ?? '', 4000);

if (mb_strlen($name) < 2) {
    out(false, 'nom manquant', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    out(false, 'adresse email invalide', 422);
}

// Adresse expéditrice par défaut.
$host = preg_replace('/^www\./', '', preg_replace('/[^a-z0-9.-]/i', '', strtolower($_SERVER['SERVER_NAME'] ?? '')) ?? '') ?: 'localhost';
if ($CONFIG['from_email'] === '') {
    $CONFIG['from_email'] = $CONFIG['smtp_user'] !== '' ? $CONFIG['smtp_user'] : 'noreply@' . $host;
}

if ($type === 'contact') {
    if (mb_strlen($msg) < 5) {
        out(false, 'message trop court', 422);
    }
    if (rate_limited($CONFIG)) {
        out(false, 'trop de messages envoyés, réessayez dans quelques minutes', 429);
    }
    $body = "Nouveau message depuis le site NR.EVO\n\nNom : $name\nEmail : $email" . ($tel !== '' ? "\nTéléphone : $tel" : '') . "\n\nMessage :\n$msg\n";
    try {
        send_mail($CONFIG, $CONFIG['team_email'], 'Message · ' . $name, $body, $email);
    } catch (Throwable $e) {
        error_log('[NR.EVO envoyer.php] contact : ' . $e->getMessage());
        out(false, 'le serveur n’a pas pu envoyer le message', 500);
    }
    out(true);
}

if ($type === 'pack') {
    $co = one_line($d['co'] ?? '', 120);
    $ref = preg_replace('/[^A-Za-z0-9-]/', '', (string) ($d['ref'] ?? '')) ?: 'NR-' . date('Ymd');
    $lines = [];
    foreach (array_slice(is_array($d['selection'] ?? null) ? $d['selection'] : [], 0, 30) as $it) {
        if (!is_array($it)) {
            continue;
        }
        $label = one_line($it['label'] ?? '', 80);
        if ($label !== '') {
            $lines[] = '- ' . (($it['kind'] ?? '') === 'Base' ? 'Base' : 'Module') . ' : ' . $label;
        }
    }
    if (!$lines) {
        out(false, 'aucune sélection', 422);
    }
    if (rate_limited($CONFIG)) {
        out(false, 'trop d’envois, réessayez dans quelques minutes', 429);
    }
    $detail = implode("\n", $lines);

    $team = "Récapitulatif $ref\n\nClient : $name" . ($co !== '' ? " ($co)" : '') . "\nEmail : $email" . ($tel !== '' ? "\nTéléphone : $tel" : '')
        . "\n\nSélection :\n$detail" . ($msg !== '' ? "\n\nPrécisions : $msg" : '')
        . "\n\nÀ recontacter pour parler des prix et des modalités.\n";
    try {
        send_mail($CONFIG, $CONFIG['team_email'], 'Récapitulatif · ' . ($co !== '' ? $co : $name), $team, $email);
    } catch (Throwable $e) {
        error_log('[NR.EVO envoyer.php] pack (équipe) : ' . $e->getMessage());
        out(false, 'le serveur n’a pas pu envoyer le récapitulatif', 500);
    }

    // Copie pour le client : un échec ici ne bloque pas la demande (l'équipe l'a déjà reçue).
    $client = "Bonjour $name,\n\nMerci pour votre demande ! Voici le récapitulatif de votre sélection (référence $ref) :\n\n$detail\n\n"
        . "Il n’y a pas de prix à ce stade : nous vous contactons très vite pour en parler avec vous, ainsi que des modalités.\n\n"
        . "L’équipe NR.EVO\n" . $CONFIG['team_email'] . "\n";
    try {
        send_mail($CONFIG, $email, 'Votre récapitulatif NR.EVO · ' . $ref, $client, $CONFIG['team_email']);
    } catch (Throwable $e) {
        error_log('[NR.EVO envoyer.php] pack (copie client) : ' . $e->getMessage());
    }
    out(true);
}

out(false, 'type de demande inconnu', 400);
