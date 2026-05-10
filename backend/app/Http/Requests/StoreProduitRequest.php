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
        $idProduit = $this->route('produit') ?? $this->route('id');
        
        return [
            'nomProduit'    => 'nullable|string|max:100',
            'reference'     => 'required|string|max:50|unique:produits,reference,' . $idProduit . ',idProduit',
            'codeBarre'     => 'nullable|string|max:50|unique:produits,codeBarre,' . $idProduit . ',idProduit',
            'photo'         => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'prixUnitaire'  => 'required|numeric|min:0',
            'seuilSecurite' => 'required|numeric|min:0',
            'quantiteInitiale' => 'nullable|numeric|min:0',
            'idCategorie'   => 'required|integer|exists:categories,idCategorie',
        ];
    }

    public function messages(): array
    {
        return [
            'reference.required'    => 'La référence est obligatoire.',
            'reference.unique'      => 'Cette référence est déjà utilisée.',
            'codeBarre.unique'      => 'Ce code barre est déjà utilisé.',
            'prixUnitaire.required' => 'Le prix unitaire est obligatoire.',
            'prixUnitaire.min'      => 'Le prix ne peut pas être négatif.',
            'seuilSecurite.required'=> 'Le seuil de sécurité est obligatoire.',
            'quantiteInitiale.min' => 'La quantité ne peut pas être négative.',
            'idCategorie.required'  => 'La catégorie est obligatoire.',
            'idCategorie.exists'    => 'Cette catégorie n\'existe pas.',
            'photo.image'           => 'Le fichier doit être une image.',
            'photo.mimes'           => 'Format accepté : jpeg, png, jpg, webp.',
            'photo.max'             => 'La photo ne doit pas dépasser 2 Mo.',
        ];
    }
}
