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
        $idProduit = $this->route('id');
        
        return [
            'reference' => 'required|string|max:50|unique:produits,reference,'.$idProduit.',idProduit',
            'codeBarre' => 'nullable|string|max:50|unique:produits,codeBarre,'.$idProduit.',idProduit',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'prixUnitaire' => 'required|numeric|min:0',
            'seuilSecurite' => 'required|numeric|min:0',
            'idCategorie' => 'required|integer|exists:categories,idCategorie',
        ];
    }
}
