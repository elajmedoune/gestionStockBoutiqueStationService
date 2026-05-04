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
            'nomProduit'    => 'required|string|max:100',
            'reference' => 'required|string|max:50|unique:produits,reference',
            'codeBarre' => 'nullable|string|max:50|unique:produits,codeBarre',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'prixUnitaire' => 'required|numeric|min:0',
            'seuilSecurite' => 'required|numeric|min:0',
            'idCategorie' => 'required|integer|exists:categories,idCategorie',
        ];
    }
}
