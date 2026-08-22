import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link href="/" className="brand" aria-label="Bloom Online — онлайн-запись">
      <img
        src="/bloom-online-icon.png"
        alt=""
        className="brand-icon"
        width={44}
        height={44}
      />
      <span className="brand-wordmark">
        bloom<span>online</span>
      </span>
    </Link>
  );
}
