import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";
import PartnerCatalog from "./components/partner-catalog";

const services = [
  { name: "Маникюр и педикюр", count: "12 специалистов", icon: "✦", color: "#f6e7e2" },
  { name: "Массаж и SPA", count: "8 специалистов", icon: "◌", color: "#e7eee5" },
  { name: "Волосы и укладки", count: "6 специалистов", icon: "〰", color: "#f3ebdb" },
  { name: "Косметология", count: "5 специалистов", icon: "✧", color: "#e9e5f0" },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <BrandLogo />
        <nav className="topnav"><a href="#catalog">Услуги</a><a href="#partners">Партнёры</a><Link href="/dashboard" className="button button-dark">Кабинет партнёра</Link></nav>
      </header>
      <section className="intro">
        <div className="eyebrow">BLOOM CLUB · ОНЛАЙН-ЗАПИСЬ</div>
        <h1>Время<br/><em>для себя.</em></h1>
        <p>Записывайтесь к проверенным мастерам красоты и заботы о себе — в удобное время и без звонков.</p>
        <a href="#catalog" className="button button-dark button-large">Выбрать услугу <span>↗</span></a>
        <div className="intro-aside"><span>01 / 04</span><span>Красота начинается<br/>с удобной записи</span></div>
      </section>
      <section className="section" id="catalog">
        <div className="section-heading"><div><div className="eyebrow">С ЧЕГО НАЧНЁМ?</div><h2>Выберите направление</h2></div><span className="muted">Всё для вашего настроения</span></div>
        <div className="category-grid">{services.map((item) => <article className="category-card" style={{backgroundColor: item.color}} key={item.name}><span className="category-icon">{item.icon}</span><h3>{item.name}</h3><span>{item.count}</span><span className="category-arrow">↗</span></article>)}</div>
      </section>
      <section className="section partner-section" id="partners"><div className="section-heading"><div><div className="eyebrow">ТЩАТЕЛЬНО ОТОБРАНЫ</div><h2>Наши партнёры</h2></div><span className="muted">Новосибирск · Москва · Екатеринбург</span></div><PartnerCatalog/></section>
      <footer className="footer"><BrandLogo /><span>Ваше время. Ваши правила.</span><Link href="/dashboard">Для партнёров →</Link></footer>
    </main>
  );
}
