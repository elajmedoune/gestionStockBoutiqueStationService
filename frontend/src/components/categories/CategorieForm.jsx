// src/components/categories/CategorieForm.jsx

import { useState, useEffect } from 'react'

const EMOJIS = ['📦', '🍔', '🍭', '🥤', '🍧', '🧴', '🔧', '🍫', '🚗', '🧹', '📰', '🎮']
const INITIAL = { libelle: '', description: '', emoji: '📦' }

function CategorieForm({ initial = null, onSubmit, onCancel, loading = false, inline = false }) {
    const [form, setForm] = useState(INITIAL)

    useEffect(() => {
        setForm(initial
            ? { libelle: initial.libelle, description: initial.description || '', emoji: initial.emoji || '📦' }
            : INITIAL
        )
    }, [initial])

    const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const submit = (e) => {
        if (e && e.preventDefault) e.preventDefault()
        if (!form.libelle.trim()) return
        onSubmit(form)
    }

    const Wrapper = inline ? 'div' : 'form'
    const wrapperProps = inline ? {} : { onSubmit: submit }

    return (
        <Wrapper {...wrapperProps} className="space-y-4">
            {/* libelle */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Libellé *</span>
                </label>
                <input type="text"
                    className="input input-bordered w-full"
                    name='libelle'
                    value={form.libelle}
                    onChange={handle}
                    required={!inline}
                    maxLength={50}
                    placeholder='Ex: Boissons'
                />
            </div>

            {/* description */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Description</span>
                </label>
                <textarea name="description"
                    className="textarea textarea-bordered w-full"
                    value={form.description}
                    onChange={handle}
                    maxLength={500}
                    rows={3}
                    placeholder='Description optionnelle...'
                />
            </div>

            {/* emoji */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Emoji</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                        <button key={e}
                            type='button'
                            onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                            className={`btn btn-sm text-lg ${form.emoji === e ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {/* boutons */}
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
                    Annuler
                </button>
                <button
                    type={inline ? 'button' : 'submit'}
                    onClick={inline ? submit : undefined}
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading && <span className='loading loading-spinner loading-xs' />}
                    {initial ? 'Modifier' : 'Créer'}
                </button>
            </div>
        </Wrapper>
    )
}
export default CategorieForm