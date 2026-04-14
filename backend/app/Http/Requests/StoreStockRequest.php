<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantiteInitiale' => 'required|integer|min:0',
            'dateEntree' => 'required|date',
            'dateExpiration' => 'required|date|after:dateEntree',
            'prixEnGros' => 'required|numeric|min:0',
            'prixAchat' => 'required|numeric|min:0',
            'idProduit' => 'required|integer|exists:produits,idProduit',
        ];
    }
}
