import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";
import PartnerCatalog from "./components/partner-catalog";

const services = [
  { name: "Маникюр и педикюр", description: "Красота в каждой детали", category: "Ногтевой сервис", shape: "petal" },
  { name: "Массаж и SPA", description: "Время восстановить силы", category: "Тело и отдых", shape: "wave" },
  { name: "Волосы и укладки", description: "Настроение, которое видно", category: "Волосы", shape: "ribbon" },
  { name: "Косметология", description: "Уход, который подходит вам", category: "Лицо и кожа", shape: "orbit" },
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
          <h1>Красота<br />начинается<br /><span>с момента.</span></h1>
          <p>Салоны, мастера и всё, что помогает почувствовать себя собой. Выбирайте удобное время и записывайтесь онлайн.</p>
          <div className="hero-actions"><a href="#salons" className="premium-primary-action">Найти своего мастера <ArrowIcon /></a><a href="#catalog" className="premium-secondary-action">Все направления</a></div>
          <div className="hero-signature"><span>Ваше время</span><span>Ваши правила</span></div>
        </div>
        <div className="hero-stage" aria-label="Онлайн-запись в салон">
          <div className="stage-bloom stage-bloom-first" aria-hidden="true" /><div className="stage-bloom stage-bloom-second" aria-hidden="true" /><div className="stage-bloom stage-bloom-third" aria-hidden="true" />
          <div className="booking-preview">
            <div className="booking-preview-heading"><span>Ваша запись</span><span>Bloom Online</span></div>
            <div className="booking-preview-service"><span>Выберите, что хочется</span><strong>Маникюр<br />и уход за собой</strong></div>
            <div className="booking-preview-detail"><span>Специалист</span><strong>Вы выбираете сами</strong></div>
            <div className="booking-preview-detail"><span>Время</span><strong>Когда удобно вам</strong></div>
            <div className="booking-preview-button"><CheckIcon /><span>Запись без звонка</span></div>
          </div>
          <span className="stage-caption">Найдите момент для себя</span>
        </div>
      </section>

      <section className="premium-promise" aria-label="Возможности сервиса"><span>Выбирайте своего мастера</span><span>Находите удобное время</span><span>Записывайтесь без звонка</span></section>

      <section className="premium-section directions-section" id="catalog">
        <div className="premium-section-heading"><h2>Всё, что делает<br /><span>ваш день лучше.</span></h2><p>Выберите то, чего хочется именно сейчас.</p></div>
        <div className="premium-directions">{services.map((service) => <a className={`direction-item direction-${service.shape}`} href="#salons" key={service.name}><span className="direction-meta">{service.category}</span><div className="direction-form" aria-hidden="true" /><div className="direction-content"><h3>{service.name}</h3><span>{service.description}</span></div><span className="direction-action" aria-label={`Найти ${service.name.toLowerCase()}`}><ArrowIcon /></span></a>)}</div>
      </section>

      <section className="premium-section salon-discovery" id="salons"><div className="premium-section-heading"><h2>Места, куда<br /><span>хочется вернуться.</span></h2><p>Салоны и мастера, к которым можно записаться прямо сейчас.</p></div><PartnerCatalog /></section>

      <section className="premium-explainer"><div className="explainer-heading"><h2>Несколько шагов.<br /><span>И время уже ваше.</span></h2></div><div className="explainer-steps">{bookingSteps.map((step) => <article className="explainer-step" key={step.title}><span className="step-mark" aria-hidden="true" /><h3>{step.title}</h3><p>{step.description}</p></article>)}</div><a href="#salons" className="explainer-link">Выбрать салон <ArrowIcon /></a></section>

      <section className="premium-business"><div><h2>Ваш салон<br /><span>заслуживает большего.</span></h2><p>Управляйте сотрудниками, услугами и расписанием. Принимайте записи там, где клиентам удобно.</p></div><Link href="/dashboard" className="business-action">Открыть личный кабинет <ArrowIcon /></Link></section>

      <footer className="footer premium-footer"><BrandLogo /><span>Ваше время. Ваши правила.</span><Link href="/dashboard">Для салонов и мастеров <ArrowIcon /></Link></footer>
    </main>
  );
}
