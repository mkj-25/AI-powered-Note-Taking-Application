import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Brain, Zap, Shield, Globe, ArrowRight,
  FileText, Mic, Search, Users, Star, CheckCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
  { icon: Brain, title: 'AI-Powered Notes', desc: 'GPT-4o understands your notes and helps you think deeper.', color: 'var(--accent)' },
  { icon: Mic, title: 'Voice to Note', desc: 'Record your thoughts — Whisper transcribes them instantly.', color: 'var(--green)' },
  { icon: Search, title: 'Semantic Search', desc: 'Find notes by meaning, not just keywords, with vector search.', color: 'var(--blue)' },
  { icon: Users, title: 'Collaboration', desc: 'Real-time multiplayer editing with Socket.io.', color: 'var(--orange)' },
  { icon: Zap, title: 'Slash Commands', desc: "/h1, /code, /todo — build rich notes at the speed of thought.", color: 'var(--accent)' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your data stays yours. JWT auth, encrypted storage.', color: 'var(--green)' },
];

const testimonials = [
  { name: 'Priya S.', role: 'Researcher', text: 'Notra replaced Notion for me. The AI chat on my notes is a game changer.' },
  { name: 'Alex M.', role: 'Engineer', text: 'Voice-to-note while commuting? Absolute productivity unlock.' },
  { name: 'Jordan K.', role: 'Student', text: 'The semantic search found a connection between my notes I completely forgot about.' },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '60px',
        background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.4px' }} className="gradient-text">Notra</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
          <Button onClick={() => navigate('/login')}>Get started free</Button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', position: 'relative' }}>
        {/* Dot grid */}
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
            fontSize: '12px', fontWeight: 500, color: 'var(--accent)',
            marginBottom: '24px',
          }}>
            <Sparkles size={12} /> AI-Powered Second Brain
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            maxWidth: '820px', margin: '0 auto 20px',
          }}>
            Your notes,{' '}
            <span className="gradient-text">supercharged</span>
            {' '}with AI
          </h1>

          <p style={{
            fontSize: '1.1rem', color: 'var(--text-secondary)',
            maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.7,
          }}>
            Notra is a Notion-like editor with GPT-4o, Whisper voice transcription, semantic search, and real-time collaboration — all in one beautiful workspace.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              id="hero-cta"
              onClick={() => navigate('/login')}
              iconRight={ArrowRight}
              style={{ height: '48px', padding: '0 28px', fontSize: '15px' }}
            >
              Start for free
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              style={{ height: '48px', padding: '0 28px', fontSize: '15px' }}
            >
              View demo
            </Button>
          </div>
        </motion.div>

        {/* Hero preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            marginTop: '60px',
            maxWidth: '900px', margin: '60px auto 0',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(139,92,246,0.08)',
          }}
        >
          {/* Fake browser bar */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)',
          }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <div style={{
              flex: 1, height: '20px', background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-full)', maxWidth: '280px', margin: '0 auto',
            }} />
          </div>
          {/* Fake editor layout */}
          <div style={{ display: 'flex', height: '340px' }}>
            {/* Sidebar */}
            <div style={{ width: '180px', borderRight: '1px solid var(--border-subtle)', padding: '14px 10px', background: 'var(--bg-secondary)' }}>
              {['Dashboard', 'Recents', 'AI Notes', 'Workspace'].map((l, i) => (
                <div key={i} style={{
                  padding: '7px 10px', borderRadius: '6px', marginBottom: '2px',
                  background: i === 3 ? 'var(--accent-light)' : 'transparent',
                  fontSize: '12px', color: i === 3 ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {l}
                </div>
              ))}
            </div>
            {/* Editor */}
            <div style={{ flex: 1, padding: '24px 30px' }}>
              <div style={{ fontWeight: 700, fontSize: '22px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Project Planning
              </div>
              {[
                { type: 'h', w: '60%' }, { type: 'p', w: '90%' }, { type: 'p', w: '75%' },
                { type: 'p', w: '85%' }, { type: 'p', w: '50%' },
              ].map((l, i) => (
                <div key={i} style={{
                  height: l.type === 'h' ? '16px' : '11px',
                  width: l.w,
                  background: l.type === 'h' ? 'var(--bg-active)' : 'var(--bg-elevated)',
                  borderRadius: '4px', marginBottom: '10px',
                }} />
              ))}
            </div>
            {/* AI panel */}
            <div style={{ width: '220px', borderLeft: '1px solid var(--border-subtle)', padding: '14px', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={12} /> AI Assistant
              </div>
              {[{ from: 'ai', w: '85%' }, { from: 'user', w: '70%' }, { from: 'ai', w: '90%' }].map((m, i) => (
                <div key={i} style={{
                  height: '30px', width: m.w, borderRadius: '8px',
                  background: m.from === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                  marginBottom: '8px',
                  marginLeft: m.from === 'user' ? 'auto' : '0',
                }} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Everything you need. Nothing you don't.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Notra combines the best of note-taking and AI productivity tools.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                background: `${f.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '60px 48px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '36px' }}>
          Loved by builders
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)', padding: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={12} fill="var(--orange)" color="var(--orange)" />)}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                "{t.text}"
              </p>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 100px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Ready to build your second brain?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '15px' }}>
            Free to start. No credit card required.
          </p>
          <Button
            id="footer-cta"
            onClick={() => navigate('/login')}
            iconRight={ArrowRight}
            style={{ height: '50px', padding: '0 32px', fontSize: '16px' }}
            className="animate-pulse-glow"
          >
            Get started free
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
      }}>
        {/* Main footer content */}
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '48px 48px 32px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '40px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent), #A78BFA)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '16px' }} className="gradient-text">Notra</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '280px' }}>
              AI-powered note-taking for the modern knowledge worker. Your second brain, supercharged.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              {[
                { label: 'GitHub', href: 'https://github.com' },
                { label: 'LinkedIn', href: 'https://linkedin.com' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px', color: 'var(--text-muted)',
                    textDecoration: 'none', padding: '5px 12px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Product</div>
            {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
              <div key={item} style={{ marginBottom: '8px' }}>
                <a href="#" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >{item}</a>
              </div>
            ))}
          </div>

          {/* Team */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Team</div>
            <div style={{
              fontSize: '14px', fontWeight: 600, color: 'var(--accent)',
              marginBottom: '10px',
            }}>Team Tactical Thinkers</div>
            {[
              { label: '📧 Email', href: 'mailto:teamtacticalthinkers@gmail.com', text: 'teamtacticalthinkers@gmail.com' },
              { label: '🐙 GitHub', href: 'https://github.com/team-tactical-thinkers', text: 'github.com/tactical-thinkers' },
              { label: '💼 LinkedIn', href: 'https://linkedin.com/company/tactical-thinkers', text: 'linkedin.com/tactical' },
            ].map((contact) => (
              <div key={contact.label} style={{ marginBottom: '8px' }}>
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {contact.label}
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-disabled)', marginTop: '1px' }}>
                    {contact.text}
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'var(--text-muted)', fontSize: '12px',
        }}>
          <span>© 2025 Notra · Built by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Team Tactical Thinkers</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Made with <span style={{ color: 'var(--red)' }}>♥</span> and GPT-4o
          </span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
