import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ExternalLink, ArrowLeft, Copy, Check, Mail, Phone, Linkedin,
  Plus, Trash2, ChevronDown, ChevronUp, User, Search
} from 'lucide-react';
import {
  getTrigger, updateTrigger, deleteContact, createContact, updateContact,
  logOutreach
} from '../lib/api.js';
import { generateOutreach } from '../lib/templates.js';
import { generateSearchLinks } from '../lib/searchLinks.js';
import UrgencyBadge from '../components/UrgencyBadge.jsx';
import TypeBadge from '../components/TypeBadge.jsx';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'meeting_booked', label: 'Meeting Booked' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'won', label: 'Won' },
  { value: 'archived', label: 'Archived' },
];

function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = useCallback((text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  return { copy, copied };
}

export default function TriggerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trigger, setTrigger] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [activeOutreachSection, setActiveOutreachSection] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrigger(id);
      setTrigger(data);
      setContacts(data.contacts || []);
      if (data.contacts?.length && !selectedContact) {
        setSelectedContact(data.contacts[0]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(e) {
    const status = e.target.value;
    setTrigger(t => ({ ...t, status }));
    await updateTrigger(id, { status });
  }

  async function handleDeleteContact(contactId) {
    if (!confirm('Delete this contact?')) return;
    await deleteContact(contactId);
    setContacts(cs => cs.filter(c => c.id !== contactId));
    if (selectedContact?.id === contactId) {
      const remaining = contacts.filter(c => c.id !== contactId);
      setSelectedContact(remaining[0] || null);
    }
  }

  async function handleContactAdded(contact) {
    setContacts(cs => [contact, ...cs]);
    setSelectedContact(contact);
    setShowAddContact(false);
  }

  if (loading && !trigger) {
    return <div className="text-center py-16 text-gray-500">Loading…</div>;
  }
  if (error) {
    return (
      <div className="card border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );
  }
  if (!trigger) return null;

  const outreach = selectedContact ? generateOutreach(trigger, selectedContact) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-4 transition-colors">
          <ArrowLeft size={12} /> Dashboard
        </Link>
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={trigger.type} />
              <UrgencyBadge urgency={trigger.urgency} />
            </div>
            <h1 className="text-lg font-semibold leading-snug">{trigger.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
              {trigger.company_be && <span className="font-medium">{trigger.company_be}</span>}
              {trigger.therapeutic_area && <span className="text-gray-500">{trigger.therapeutic_area}</span>}
              {trigger.source_url && (
                <a
                  href={trigger.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand hover:text-blue-300 text-xs transition-colors"
                >
                  <ExternalLink size={11} />
                  {trigger.source_name || 'View Source'}
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={trigger.status}
              onChange={handleStatusChange}
              className="input text-xs py-1.5 w-auto"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        {trigger.description && (
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">{trigger.description}</p>
        )}
      </div>

      {/* Find Contacts section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Search size={14} className="text-gray-500" />
            Find Contacts
          </h2>
        </div>

        {trigger.suggested_roles?.length > 0 ? (
          <div className="space-y-3">
            {trigger.suggested_roles.map(role => (
              <SearchLinksRow
                key={role}
                role={role}
                company={trigger.company || ''}
                domain={trigger.company_domain || ''}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No suggested roles for this trigger.</p>
        )}
      </section>

      {/* Saved Contacts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <User size={14} className="text-gray-500" />
            Saved Contacts
            {contacts.length > 0 && (
              <span className="tag bg-surface-3 text-gray-400">{contacts.length}</span>
            )}
          </h2>
          <button
            onClick={() => setShowAddContact(v => !v)}
            className="btn-ghost text-xs"
          >
            <Plus size={13} />
            Add Contact
          </button>
        </div>

        {showAddContact && (
          <AddContactForm triggerId={id} onSaved={handleContactAdded} onCancel={() => setShowAddContact(false)} />
        )}

        {contacts.length === 0 && !showAddContact && (
          <p className="text-sm text-gray-500 py-2">
            No contacts yet. Find someone using the search links above, then add them here.
          </p>
        )}

        {contacts.length > 0 && (
          <div className="space-y-2">
            {contacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                selected={selectedContact?.id === contact.id}
                onSelect={() => setSelectedContact(contact)}
                onDelete={() => handleDeleteContact(contact.id)}
                onUpdated={(updated) => {
                  setContacts(cs => cs.map(c => c.id === updated.id ? updated : c));
                  if (selectedContact?.id === updated.id) setSelectedContact(updated);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Outreach Generator */}
      {contacts.length > 0 && (
        <section className="space-y-3">
          <button
            onClick={() => setActiveOutreachSection(v => !v)}
            className="w-full flex items-center justify-between text-sm font-semibold hover:text-gray-100 text-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Mail size={14} className="text-gray-500" />
              Outreach Templates
              {selectedContact && (
                <span className="text-gray-500 font-normal text-xs">— {selectedContact.name}</span>
              )}
            </span>
            {activeOutreachSection ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
          </button>

          {activeOutreachSection && (
            <>
              {contacts.length > 1 && (
                <div>
                  <label className="label">Generate outreach for</label>
                  <select
                    className="input text-sm w-auto"
                    value={selectedContact?.id || ''}
                    onChange={e => setSelectedContact(contacts.find(c => c.id === e.target.value))}
                  >
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.role || 'No role'}</option>
                    ))}
                  </select>
                </div>
              )}

              {outreach && selectedContact && (
                <OutreachTemplates
                  outreach={outreach}
                  trigger={trigger}
                  contact={selectedContact}
                />
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

// ── Search Links Row ──────────────────────────────────────────────────────────
function SearchLinksRow({ role, company, domain }) {
  const links = generateSearchLinks(role, company, domain);
  return (
    <div className="card px-4 py-3">
      <div className="text-xs font-medium text-gray-300 mb-2">{role}</div>
      <div className="flex flex-wrap gap-2">
        {links.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-surface-2 text-gray-300 hover:bg-surface-3 hover:text-gray-100 transition-colors border border-surface-3"
          >
            <ExternalLink size={10} />
            {link.label}
            {link.free && <span className="text-[10px] text-green-500">free</span>}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Add Contact Form ──────────────────────────────────────────────────────────
function AddContactForm({ triggerId, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', linkedin_url: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const contact = await createContact({ trigger_id: triggerId, ...form });
      onSaved(contact);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <div className="text-xs font-semibold text-gray-300">Add Contact</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" placeholder="Sophie Martens" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Role / Title</label>
          <input className="input" placeholder="Brand Manager" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="s.martens@astrazeneca.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" type="tel" placeholder="+32 ..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">LinkedIn URL</label>
          <input className="input" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Contact'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

// ── Contact Card ──────────────────────────────────────────────────────────────
function ContactCard({ contact, selected, onSelect, onDelete, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: contact.name, role: contact.role || '', email: contact.email || '', phone: contact.phone || '', linkedin_url: contact.linkedin_url || '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateContact(contact.id, form);
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="card p-4 space-y-3 border-brand/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">LinkedIn URL</label>
            <input className="input" value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => setEditing(false)} className="btn-ghost text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`card px-4 py-3 cursor-pointer transition-colors ${selected ? 'border-brand/40 bg-surface-2' : 'hover:bg-surface-2'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-100">{contact.name}</span>
            {contact.role && <span className="text-xs text-gray-500">{contact.role}</span>}
            {selected && <span className="tag bg-brand/20 text-brand text-[10px]">selected</span>}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {contact.email && (
              <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand transition-colors">
                <Mail size={11} />{contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand transition-colors">
                <Phone size={11} />{contact.phone}
              </a>
            )}
            {contact.linkedin_url && (
              <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin size={11} />LinkedIn
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => setEditing(true)} className="btn-ghost text-xs px-2">Edit</button>
          <button onClick={onDelete} className="btn-danger text-xs px-2">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Outreach Templates ────────────────────────────────────────────────────────
function OutreachTemplates({ outreach, trigger, contact }) {
  const { copy, copied } = useCopy();

  const channels = [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-400',
      content: outreach.linkedin,
      maxLen: 300,
      action: contact.linkedin_url ? { label: 'Open Profile', href: contact.linkedin_url } : null,
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'text-purple-400',
      subject: outreach.email?.subject,
      content: outreach.email?.body,
      action: contact.email
        ? {
            label: 'Open in Mail',
            href: `mailto:${contact.email}?subject=${encodeURIComponent(outreach.email?.subject || '')}&body=${encodeURIComponent(outreach.email?.body || '')}`,
          }
        : null,
    },
    {
      id: 'call',
      label: 'Call Script',
      icon: Phone,
      color: 'text-green-400',
      content: outreach.call,
      action: contact.phone ? { label: 'Call', href: `tel:${contact.phone}` } : null,
    },
  ];

  async function handleLogOutreach(channel) {
    await logOutreach({
      contact_id: contact.id,
      channel,
      message_content: channel === 'email'
        ? `Subject: ${outreach.email?.subject}\n\n${outreach.email?.body}`
        : channel === 'linkedin' ? outreach.linkedin : outreach.call,
    });
  }

  return (
    <div className="space-y-3">
      {channels.map(ch => (
        <div key={ch.id} className="card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-sm font-medium ${ch.color}`}>
              <ch.icon size={14} />
              {ch.label}
            </div>
            <div className="flex items-center gap-2">
              {ch.action && (
                <a
                  href={ch.action.href}
                  target={ch.id === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  onClick={() => handleLogOutreach(ch.id)}
                  className="btn-ghost text-xs"
                >
                  <ExternalLink size={11} />
                  {ch.action.label}
                </a>
              )}
              <button
                onClick={() => {
                  const text = ch.id === 'email'
                    ? `Subject: ${ch.subject}\n\n${ch.content}`
                    : ch.content;
                  copy(text, ch.id);
                  handleLogOutreach(ch.id);
                }}
                className="btn-ghost text-xs"
              >
                {copied === ch.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied === ch.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {ch.subject && (
            <div className="text-xs text-gray-500">
              Subject: <span className="text-gray-300 font-medium">{ch.subject}</span>
            </div>
          )}

          <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-mono bg-surface-0 rounded-lg p-3 border border-surface-3">
            {ch.content}
          </pre>

          {ch.id === 'linkedin' && ch.content && (
            <div className={`text-[10px] font-mono ${ch.content.length > 300 ? 'text-amber-400' : 'text-gray-600'}`}>
              {ch.content.length}/300 chars {ch.content.length > 300 ? '(too long for connection request — use InMail)' : '(fits connection request)'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
