import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { AdminField } from '../../components/admin/AdminField';
import { FileDropzone } from '../../components/admin/FileDropzone';
import { ReorderControls, swapOrder } from '../../components/admin/ReorderControls';
import { uploadFile } from '../../lib/upload';
import { confirmAction } from '../../lib/adminUtils';
import { ProjectCover } from '../../components/projects/ProjectCover';
import { normalizeCoverSrc } from '../../lib/normalizeCoverSrc';

export function AdminHomeSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [newSlide, setNewSlide] = useState({ src: '', alt_text: '' });

  async function load() {
    const { data, error } = await supabase
      .from('home_slides')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setSlides(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Home Slides — CMS';
    load();
  }, []);

  function updateLocal(id, patch) {
    setSlides((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newSlide.src.trim()) return;
    const { count } = await supabase.from('home_slides').select('id', { count: 'exact', head: true });
    const { error } = await supabase.from('home_slides').insert({
      src: newSlide.src.trim(),
      alt_text: newSlide.alt_text.trim() || 'Slide',
      sort_order: count ?? 0,
      is_published: true,
    });
    if (error) setFeedback({ type: 'error', message: error.message });
    else {
      setNewSlide({ src: '', alt_text: '' });
      load();
    }
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this slide?')) return;
    const { error } = await supabase.from('home_slides').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function handleSaveAll() {
    setSaving(true);
    const results = await Promise.all(
      slides.map((s) =>
        supabase
          .from('home_slides')
          .update({
            src: s.src,
            alt_text: s.alt_text,
            sort_order: s.sort_order,
            is_published: s.is_published,
          })
          .eq('id', s.id)
      )
    );
    const err = results.find((r) => r.error)?.error;
    setSaving(false);
    setFeedback(err ? { type: 'error', message: err.message } : { type: 'success', message: 'Slides saved.' });
  }

  function move(index, delta) {
    setSlides((list) => swapOrder(list, index, index + delta));
  }

  return (
    <>
      <h1 className="admin-page-title">Home slider</h1>
      <p style={{ color: 'var(--admin-muted)', marginBottom: '1.5rem' }}>
        Carousel images on the homepage. The hero section in <strong>Hero</strong> can override the first slide
        background when set to an image or video.
      </p>
      {feedback && <AdminFeedback feedback={feedback} />}

      <form className="admin-card" onSubmit={handleAdd} style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Add slide</h3>
        <AdminField label="Image path or URL">
          <input
            className="admin-input"
            value={newSlide.src}
            onChange={(e) => setNewSlide((s) => ({ ...s, src: e.target.value }))}
            placeholder="/images/slider/example.jpg"
          />
        </AdminField>
        <FileDropzone
          accept="image/*"
          onFile={async (file) => {
            const { url, error } = await uploadFile('hero-backgrounds', file);
            if (error) setFeedback({ type: 'error', message: error.message });
            else if (url) setNewSlide((s) => ({ ...s, src: url }));
          }}
        />
        <AdminField label="Alt text">
          <input
            className="admin-input"
            value={newSlide.alt_text}
            onChange={(e) => setNewSlide((s) => ({ ...s, alt_text: e.target.value }))}
          />
        </AdminField>
        <button type="submit" className="admin-btn admin-btn-primary">
          Add slide
        </button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Preview</th>
                  <th>Source</th>
                  <th>Alt</th>
                  <th>Published</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {slides.map((slide, i) => (
                  <tr key={slide.id}>
                    <td>
                      <ReorderControls
                        canMoveUp={i > 0}
                        canMoveDown={i < slides.length - 1}
                        onMoveUp={() => move(i, -1)}
                        onMoveDown={() => move(i, 1)}
                      />
                    </td>
                    <td>
                      <ProjectCover
                        title={slide.alt_text}
                        coverSrc={normalizeCoverSrc(slide.src)}
                        className="admin-thumb"
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={slide.src}
                        onChange={(e) => updateLocal(slide.id, { src: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={slide.alt_text ?? ''}
                        onChange={(e) => updateLocal(slide.id, { alt_text: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={slide.is_published}
                        onChange={(e) => updateLocal(slide.id, { is_published: e.target.checked })}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => handleDelete(slide.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={saving}
            onClick={handleSaveAll}
          >
            {saving ? 'Saving…' : 'Save all slides'}
          </button>
        </>
      )}
    </>
  );
}
