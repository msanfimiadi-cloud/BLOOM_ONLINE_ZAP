"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Organization={id:string;slug:string;name:string;city:string;address:string;category:string;color:string;staff_count:number;min_price:number|null};
export default function PartnerCatalog(){
 const [organizations,setOrganizations]=useState<Organization[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/booking?kind=organizations").then(async(response)=>{const data=await response.json();if(!response.ok)throw new Error(data.error);setOrganizations(data.organizations??[])}).catch((error)=>setError(error.message)).finally(()=>setLoading(false))},[]);
 if(loading)return <div className="partner-empty">Подбираем проверенных партнёров…</div>;
 if(error)return <div className="partner-empty">Не удалось загрузить каталог: {error}</div>;
 if(!organizations.length)return <div className="partner-empty">Скоро здесь появятся новые партнёры.</div>;
 return <div className="partner-grid">{organizations.map(org=><Link href={`/book/${org.slug}`} className="partner-card" key={org.id}><div className="partner-cover" style={{backgroundColor:org.color}}><span>{org.name.split(" ").map(word=>word[0]).join("")}</span><span className="partner-cover-tag">BLOOM PARTNER</span></div><div className="partner-info"><div><h3>{org.name}</h3><span className="muted">{org.category} · {org.city}</span></div><span className="partner-link">↗</span></div><div className="partner-meta"><span>{org.staff_count} спец.</span><span>{org.min_price?`от ${new Intl.NumberFormat("ru-RU").format(org.min_price)} ₽`:"Цена по запросу"}</span></div></Link>)}</div>
}
