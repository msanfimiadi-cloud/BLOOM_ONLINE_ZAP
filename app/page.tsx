import Link from "next/link";
import Image from "next/image";
import BrandLogo from "@/app/components/brand-logo";
import PartnerCatalog from "./components/partner-catalog";

const services = [
  { name: "Маникюр и педикюр", description: "Красота в каждой детали", category: "Ногтевой сервис", image: "/services/manicure.webp" },
  { name: "Массаж и SPA", description: "Время восстановить силы", category: "Тело и отдых", image: "/services/massage.webp" },
  { name: "Волосы и укладки", description: "Настроение, которое видно", category: "Волосы", image: "/services/hair.webp" },
  { name: "Косметология", description: "Уход, который подходит вам", category: "Лицо и кожа", image: "/services/cosmetology.webp" },
];

const bookingSteps = [
  { title: "Выберите место", description: "Откройте подходящий салон или страницу частного мастера." },
  { title: "Найдите своё время", description: "Посмотрите услуги, специалистов и доступные часы записи." },
  { title: "Запишитесь онлайн", description: "Оставьте данные и получите подтверждение без звонков." },
];

function ArrowIcon({ className }: { className?: string }) {
  return <svg className={className} width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Home() {
  return (
    <main className="site-shell bloom-premium">
      <header className="topbar premium-topbar">
        <BrandLogo />
        <nav className="topnav" aria-label="Основная навигация">
          <a href="#catalog">Услуги</a>
          <a href="#salons">Салоны и мастера</a>
          <Link href="/dashboard" className="premium-account-link">Личный кабинет <ArrowIcon /></Link>
        </nav>
      </header>

      <section className="premium-hero">
        <div className="hero-copy">
          <h1>Ваше время<br /><span>для красоты.</span></h1>
          <p>Салоны красоты и любимые мастера — в одном месте. Выбирайте услугу, удобное время и записывайтесь онлайн.</p>
          <div className="hero-actions"><a href="#salons" className="premium-primary-action">Выбрать салон <ArrowIcon /></a><a href="#catalog" className="premium-secondary-action">Посмотреть услуги</a></div>
          <div className="hero-benefits"><span><CheckIcon /> Без звонков</span><span><CheckIcon /> В удобное время</span></div>
        </div>
        <div className="hero-stage" aria-label="Bloom Online — часть экосистемы Bloom Club">
          <div className="hero-brand-mark"><Image src="/bloom-online-icon.png" alt="" width={196} height={196} priority /></div>
          <strong>Забота о себе<br />начинается здесь</strong>
          <a href="#salons" className="hero-stage-link">Найти своего мастера <ArrowIcon /></a>
        </div>
      </section>

      <section className="premium-section directions-section" id="catalog">
        <div className="premium-section-heading"><h2>Услуги <span>для вас</span></h2><p>Выберите то, чего хочется именно сейчас.</p></div>
        <div className="premium-directions">{services.map((service) => <a className="direction-item direction-photo-card" href="#salons" key={service.name}><Image className="direction-photo" src={service.image} alt={service.name} fill sizes="(max-width: 740px) 100vw, (max-width: 1050px) 50vw, 25vw" /><span className="direction-meta">{service.category}</span><div className="direction-content"><h3>{service.name}</h3><span>{service.description}</span></div><span className="direction-action" aria-label={`Найти ${service.name.toLowerCase()}`}><ArrowIcon /></span></a>)}</div>
      </section>

      <section className="premium-section salon-discovery" id="salons"><div className="premium-section-heading"><h2>Салоны <span>и мастера</span></h2><p>Находите своего специалиста и записывайтесь онлайн.</p></div><PartnerCatalog /></section>

      <section className="premium-explainer"><div className="explainer-heading"><h2>Записаться —<br /><span>это просто</span></h2></div><div className="explainer-steps">{bookingSteps.map((step) => <article className="explainer-step" key={step.title}><span className="step-mark" aria-hidden="true" /><h3>{step.title}</h3><p>{step.description}</p></article>)}</div><a href="#salons" className="explainer-link">Выбрать салон <ArrowIcon /></a></section>

      <section className="premium-business"><div><h2>У вас салон красоты<br /><span>или собственная практика?</span></h2><p>Управляйте сотрудниками, услугами и расписанием. Принимайте записи там, где клиентам удобно.</p></div><Link href="/dashboard" className="business-action">Открыть личный кабинет <ArrowIcon /></Link></section>

      <footer className="footer premium-footer"><BrandLogo /><span>Ваше время. Ваши правила.</span><Link href="/dashboard">Для салонов и мастеров <ArrowIcon /></Link></footer>
    </main>
  );
}
