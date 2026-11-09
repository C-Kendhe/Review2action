import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Gift,
  Heart,
  MessageCircle,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
} from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onOpenWorkspace: () => void;
  onUpload: () => void;
  onExploreSample: () => void;
  isLoading: boolean;
}

export function LandingPage({ onOpenWorkspace, onUpload, onExploreSample, isLoading }: LandingPageProps) {
  return (
    <div className="welcome-page">
      <div className="welcome-orb welcome-orb-one" />
      <div className="welcome-orb welcome-orb-two" />

      <header className="welcome-header">
        <a className="welcome-brand" href="#top" aria-label="Review2Action home">
          <span className="brand-mark"><Sparkles size={19} strokeWidth={2.2} /></span>
          <span className="brand-name">Review<span>2</span>Action</span>
          <span className="brand-ai">AI</span>
        </a>
        <nav className="welcome-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#what-you-get">What you get</a>
        </nav>
        <button className="welcome-header-cta" onClick={onOpenWorkspace}>
          Open workspace <ArrowRight size={15} />
        </button>
      </header>

      <main id="top">
        <section className="welcome-hero">
          <div className="hero-copy">
            <div className="welcome-eyebrow"><span className="eyebrow-icon"><Gift size={14} /></span> GOOD FEEDBACK IS A GIFT</div>
            <h1>Unwrap the insight in <em>every review.</em></h1>
            <p className="hero-description">
              Turn the words customers leave behind into clear signals, thoughtful recommendations, and better experiences for the next person.
            </p>
            <div className="hero-actions">
              <button className="primary-action" onClick={onUpload}>
                <UploadCloud size={17} /> Start with your reviews <ArrowRight size={16} className="action-arrow" />
              </button>
              <button className="secondary-action" onClick={onExploreSample} disabled={isLoading}>
                {isLoading ? <span className="tiny-spinner" /> : <BarChart3 size={16} />}
                {isLoading ? 'Preparing your preview…' : 'Explore a sample'}
              </button>
            </div>
            <div className="hero-assurance"><ShieldCheck size={15} /> Private by default <i /> No API key needed <i /> Results backed by real reviews</div>
          </div>

          <div className="hero-art" aria-label="Preview of customer review insights">
            <div className="art-glow" />
            <div className="art-confetti confetti-one">✳</div>
            <div className="art-confetti confetti-two">✦</div>
            <div className="art-confetti confetti-three">✧</div>
            <div className="gift-ribbon ribbon-vertical" />
            <div className="gift-ribbon ribbon-horizontal" />

            <div className="review-glass glass-float">
              <div className="review-glass-top"><span className="customer-avatar">J</span><div><strong>Jamie R.</strong><small>Verified purchase</small></div><span className="positive-pill"><Heart size={12} fill="currentColor" /> Love it</span></div>
              <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
              <p>“Finally, something that feels as good as it looks. The little details make all the difference.”</p>
              <div className="review-meta"><span>★★★★★ <b>5.0</b></span><span>1 of 248 voices</span></div>
            </div>

            <div className="insight-glass glass-float-delay">
              <div className="insight-heading"><span className="insight-icon"><Sparkles size={15} /></span><span>What customers are saying</span><span className="live-dot" /></div>
              <div className="insight-topic"><div><span className="topic-label">Packaging</span><span className="topic-sub">A moment worth remembering</span></div><strong>31%</strong></div>
              <div className="topic-track"><span /></div>
              <div className="insight-foot"><span><span className="sentiment-dot" /> Trending positively</span><span>View insight <ChevronRight size={13} /></span></div>
            </div>

            <div className="action-chip"><span className="action-chip-icon"><Check size={14} /></span><span><b>One thoughtful next step</b><small>Make unboxing even more special</small></span></div>
            <div className="art-caption"><span className="caption-dot" /> A little clarity, wrapped up</div>
          </div>
          <a className="scroll-cue" href="#how-it-works" aria-label="Scroll to how it works"><ArrowDown size={15} /> <span>See how it works</span></a>
        </section>

        <section className="welcome-proof" id="what-you-get">
          <div className="proof-intro"><span className="section-kicker">FROM VOICES TO VALUE</span><h2>Customer feedback,<br /><em>made meaningful.</em></h2><p>All the warmth of listening closely, with the clarity to know what to do next.</p></div>
          <div className="proof-card proof-card-rose"><span className="proof-icon"><MessageCircle size={19} /></span><span className="proof-overline">HEAR THE WHOLE STORY</span><h3>Every voice, in context</h3><p>Clean and organize reviews while keeping the words and evidence that matter close at hand.</p><span className="proof-number">01</span></div>
          <div className="proof-card proof-card-lilac"><span className="proof-icon"><BarChart3 size={19} /></span><span className="proof-overline">FIND THE PATTERNS</span><h3>See what’s underneath</h3><p>Spot sentiment shifts and recurring themes across products, ratings, and time.</p><span className="proof-number">02</span></div>
          <div className="proof-card proof-card-gold"><span className="proof-icon"><PackageOpen size={19} /></span><span className="proof-overline">GIVE INSIGHT A HOME</span><h3>Make the next move</h3><p>Share prioritized actions with owners, impact, and customer quotes that support each one.</p><span className="proof-number">03</span></div>
        </section>

        <section className="welcome-process" id="how-it-works">
          <div className="process-heading"><span className="section-kicker">A SIMPLE LITTLE RITUAL</span><h2>From <em>“I heard you”</em> to “here’s what’s next.”</h2><p>Bring the feedback. We’ll help you find the signal and make it actionable.</p></div>
          <div className="process-steps">
            <div className="process-step"><span className="step-number">1</span><div><b>Bring your reviews</b><p>Upload a CSV or explore with a sample dataset.</p></div></div>
            <div className="step-connector" />
            <div className="process-step"><span className="step-number">2</span><div><b>Discover what matters</b><p>See sentiment, topics, and the patterns behind them.</p></div></div>
            <div className="step-connector" />
            <div className="process-step"><span className="step-number">3</span><div><b>Share a better next step</b><p>Turn evidence into a clear action your team can own.</p></div></div>
          </div>
          <div className="process-cta-wrap"><button className="primary-action" onClick={onUpload}><UploadCloud size={17} /> Let’s unwrap your reviews <ArrowRight size={16} className="action-arrow" /></button><span><Star size={13} fill="currentColor" /> Start with a CSV, stay for the “aha” moment.</span></div>
        </section>
      </main>

      <footer className="welcome-footer"><a className="welcome-brand" href="#top"><span className="brand-mark"><Sparkles size={17} /></span><span className="brand-name">Review<span>2</span>Action</span><span className="brand-ai">AI</span></a><span>Listen well. Act thoughtfully.</span><button onClick={onOpenWorkspace}>Go to workspace <ArrowRight size={14} /></button></footer>
    </div>
  );
}
