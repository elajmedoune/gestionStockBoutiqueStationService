<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Lien de réinitialisation pointant vers le frontend SPA
        ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        });

        // ⚠️ DEV LOCAL UNIQUEMENT — désactive la vérification SSL du certificat Gmail
        // pour contourner le problème de bundle CA manquant sur PHP Windows.
        // À retirer en production (ou à conditionner avec App::environment('local')).
        Mail::extend('smtp', function (array $config) {
            $factory = new EsmtpTransportFactory();

            $scheme = $config['scheme'] ?? null;
            if (! $scheme) {
                $scheme = ! empty($config['encryption']) && $config['encryption'] === 'tls'
                    ? (($config['port'] == 465) ? 'smtps' : 'smtp')
                    : 'smtp';
            }

            /** @var EsmtpTransport $transport */
            $transport = $factory->create(new Dsn(
                $scheme,
                $config['host'],
                $config['username'] ?? null,
                $config['password'] ?? null,
                $config['port'] ?? null,
                $config
            ));

            $transport->getStream()->setStreamOptions([
                'ssl' => [
                    'verify_peer'       => false,
                    'verify_peer_name'  => false,
                    'allow_self_signed' => true,
                ],
            ]);

            return $transport;
        });
    }
}