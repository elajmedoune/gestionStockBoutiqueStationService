<?php
namespace App\Mail;

use App\Models\Commande;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CommandePassee extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Commande $commande,
        public string $companyName    = 'Boutique Station Service',
        public string $companyAddress = 'Thies, Senegal',
        public string $appName        = 'GestStock SN',
        public string $companyEmail   = '',
        public string $companyPhone   = ''
    ) {}

    public function build()
    {
        return $this->subject('Nouvelle commande - ' . $this->appName)
                    ->view('emails.commande')
                    ->with([
                        'appName' => $this->appName,
                        'company' => $this->companyName,
                        'address' => $this->companyAddress,
                        'email'   => $this->companyEmail,
                        'phone'   => $this->companyPhone,
                    ]);
    }
}