<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference' => 'required|string|max:50|unique'.$idProduit.'idProduit',
            'codeBarre' => 'required|string|max:50|unique'.$idProduit.'idProduit',
            'prixUnitaire' => 'required|numeric|min:0',
            'seuilSecurite' => 'required|numeric|min:0',
            'idCategorie' => 'required|integer|exists:categories,idCategorie',
        ];
    }
}
