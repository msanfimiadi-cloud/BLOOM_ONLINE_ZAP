"use client";
import {FormEvent,useState} from "react";
import BrandLogo from "@/app/components/brand-logo";

export default function LoginPage(){
 const[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{const returnTo=new URLSearchParams(window.location.search).get("return_to"),response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,returnTo})}),result=await response.json();if(!response.ok)throw Error(result.error);window.location.href=result.returnTo}catch(reason){setError(reason instanceof Error?reason.message:"Не удалось войти.")}finally{setBusy(false)}}
 return <main className="login-page"><form className="login-card" onSubmit={submit}><BrandLogo/><div className="eyebrow">BLOOM ONLINE · ДЛЯ БИЗНЕСА</div><h1>Личный кабинет</h1><p>Управляйте сотрудниками, услугами, графиком работы и записями клиентов.</p><label className="field-label">Email<input type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/></label><label className="field-label">Пароль<input type="password" autoComplete="current-password" minLength={12} required value={password} onChange={event=>setPassword(event.target.value)}/></label>{error&&<p className="error-text">{error}</p>}<button className="button button-dark button-large" disabled={busy}>{busy?"Входим…":"Войти"}</button></form></main>
}
