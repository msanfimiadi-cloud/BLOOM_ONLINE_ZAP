"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Organization={id:string;slug:string;name:string;city:string;address:string;category:string;color:string;image_url:string;staff_count:number;min_price:number|null};
export default function PartnerCatalog(){
 const [organizations,setOrganizations]=useState<Organization[]>([]),[cities,setCities]=useState<string[]>([]),[city,setCity]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/booking?kind=organizations").then(async(response)=>{const data=await response.json();if(!response.ok)throw new Error(data.error);setOrganizations(data.organizations??[]);setCities((data.cities??[]).sort((first:string,second:string)=>first.localeCompare(second,"ru")))}).catch((error)=>setError(error.message)).finally(()=>setLoading(false))},[]);
 const filteredOrganizations=useMemo(()=>city?organizations.filter(item=>item.city.trim()===city):organizations,[organizations,city]);
 if(loading)return <div className="partner-empty">Подбираем салоны и мастеров…</div>;
 if(error)return <div className="partner-empty">Не удалось загрузить каталог: {error}</div>;
 if(!organizations.length&&!cities.length)return <div className="partner-empty">Скоро здесь появятся салоны и частные мастера.</div>;
 return <><div className="catalog-toolbar"><label className="city-filter"><span>Ваш город</span><select value={city} onChange={event=>setCity(event.target.value)} aria-label="Выберите город"><option value="">Все города</option>{cities.map(item=><option value={item} key={item}>{item}</option>)}</select></label><span className="catalog-count">{filteredOrganizations.length} {filteredOrganizations.length===1?"салон или мастер":"салонов и мастеров"}</span></div><div className="partner-grid">{filteredOrganizations.map(org=><Link href={`/book/${org.slug}`} className="partner-card" key={org.id}><div className="partner-cover" style={{backgroundColor:org.color}}>{org.image_url?<img className="partner-cover-photo" src={org.image_url} alt={org.name}/>:<span>{org.name.split(" ").map(word=>word[0]).join("")}</span>}<span className="partner-cover-tag">BLOOM ONLINE</span></div><div className="partner-info"><div><h3>{org.name}</h3><span className="muted">{org.category} · {org.city}</span></div><span className="partner-link">↗</span></div><div className="partner-meta"><span>{org.staff_count} спец.</span><span>{org.min_price?`от ${new Intl.NumberFormat("ru-RU").format(org.min_price)} ₽`:"Цена по запросу"}</span></div></Link>)}</div>{!filteredOrganizations.length&&<div className="partner-empty">В этом городе пока нет опубликованных салонов.</div>}</>
}
