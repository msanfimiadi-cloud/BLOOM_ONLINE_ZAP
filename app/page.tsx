import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";
import PartnerCatalog from "./components/partner-catalog";

const services = [
  { name: "Маникюр и педикюр", count: "Салоны и частные мастера", icon: "✦", color: "#f6e7e2" },
  { name: "Массаж и SPA", count: "Забота о теле", icon: "◌", color: "#e7eee5" },
  { name: "Волосы и укладки", count: "Студии и стилисты", icon: "〰", color: "#f3ebdb" },
  { name: "Косметология", count: "Уход и красота", icon: "✧", color: "#e9e5f0" },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <BrandLogo />
        <nav className="topnav"><a href="#catalog">Услуги</a><a href="#salons">Салоны и мастера</a><Link href="/dashboard" className="button button-dark">Личный кабинет</Link></nav>
      </header>
      <section className="intro">
        <div className="intro-content">
          <div className="eyebrow">BLOOM CLUB · ОНЛАЙН-ЗАПИСЬ</div>
          <h1>Время<br/><em>для себя.</em></h1>
          <p>Записывайтесь к проверенным мастерам красоты и заботы о себе — в удобное время и без звонков.</p>
          <div className="intro-actions"><a href="#catalog" className="button button-dark button-large">Выбрать услугу <span>↗</span></a><a href="#salons" className="intro-secondary">Найти салон <span>→</span></a></div>
        </div>
        <div className="intro-visual" aria-hidden="true">
          <div className="intro-orbit intro-orbit-outer"/><div className="intro-orbit intro-orbit-inner"/>
          <div className="intro-blossom"><span>✳</span></div>
          <div className="intro-note"><span className="intro-note-icon">✦</span><div><strong>Ваш момент заботы</strong><span>Мастер · Услуга · Удобное время</span></div></div>
        </div>
        <div className="intro-aside"><span>01 / 04</span><span>Красота начинается<br/>с удобной записи</span></div>
      </section>
      <section className="section" id="catalog">
        <div className="section-heading"><div><div className="eyebrow">С ЧЕГО НАЧНЁМ?</div><h2>Выберите направление</h2></div><span className="muted">Всё для вашего настроения</span></div>
        <div className="category-grid">{services.map((item) => <article className="category-card" style={{backgroundColor: item.color}} key={item.name}><span className="category-icon">{item.icon}</span><h3>{item.name}</h3><span>{item.count}</span><span className="category-arrow">↗</span></article>)}</div>
      </section>
      <section className="section partner-section" id="salons"><div className="section-heading"><div><div className="eyebrow">ОНЛАЙН-ЗАПИСЬ БЕЗ ЗВОНКОВ</div><h2>Салоны и мастера</h2></div><span className="muted">Выберите подходящее место и время</span></div><PartnerCatalog/></section>
      <footer className="footer"><BrandLogo /><span>Ваше время. Ваши правила.</span><Link href="/dashboard">Для салонов и мастеров →</Link></footer>
    </main>
  );
}
