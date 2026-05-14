<?php
namespace App\Mail;

use App\Models\Commande;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CommandePassee extends Mailable
{
    use SerializesModels;

    public function __construct(public Commande $commande) {}

    public function build()
    {
        return $this->subject('Nouvelle commande — Boutique Station Service')
                    ->view('emails.commande');
    }
}