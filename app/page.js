'use client';
import { useState } from 'react';

const emptyForm = { registration: '' };
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this an official DVSA service?', acceptedAnswer: { '@type': 'Answer', text: 'No. MOT Brief is an independent tool that analyses MOT history returned from the DVSA MOT History API.' } },
    { '@type': 'Question', name: 'Can MOT history tell me whether a car is good?', acceptedAnswer: { '@type': 'Answer', text: 'It can highlight patterns, current advisories and mileage inconsistencies, but it cannot confirm a car’s mechanical condition. Inspect the car and consider an independent pre-purchase inspection.' } },
    { '@type': 'Question', name: 'Does this check stolen status, finance or insurance write-offs?', acceptedAnswer: { '@type': 'Answer', text: 'No. Those checks require a separate vehicle-history provider.' } }
  ]
};
function passRateTone(passRate) {
  if (passRate === null || passRate === undefined) return 'unknown';
  if (passRate >= 80) return 'high';
  if (passRate >= 60) return 'average';
  return 'low';
}
export default function Home() {
  const [form, setForm] = useState(emptyForm), [result, setResult] = useState(null), [message, setMessage] = useState(''), [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setResult(null); setMessage('Checking official sources…');
    try {
      const response = await fetch('/api/analyse', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Lookup failed.');
      setResult(data); setMessage('');
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  }
  const vehicleName = result && [result.vehicle.make, result.vehicle.yearOfManufacture && `(${result.vehicle.yearOfManufacture})`].filter(Boolean).join(' ');
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><p className="eyebrow">MOT BRIEF · UK USED-CAR SCREENING</p><h1>Free MOT history check for used-car buyers.</h1><p className="intro">Enter a registration to turn official MOT history into a clear buyer summary: what looks reassuring, what needs checking, and what to ask the seller before you view the car.</p>
    <section className="why-us" aria-label="Why use MOT Brief"><div className="why-problem"><p className="why-label">MOT history on its own</p><ul><li>Long lists of technical defects</li><li>Old failures can look worse than they are</li><li>Hard to spot the problems that still matter</li><li>Leaves you wondering what to ask the seller</li></ul></div><div className="why-solution"><p className="why-label">MOT Brief</p><ul><li>A clear MOT-history buyer score</li><li>Earlier issues separated from current concerns</li><li>Plain-English points to inspect or ask about</li><li>Fast context before you spend time viewing a car</li></ul></div></section>
    <form onSubmit={submit}><label>Registration<input required value={form.registration} placeholder="AB12 CDE" onChange={event => setForm({ ...form, registration: event.target.value })} /></label><button disabled={loading}>{loading ? 'Analysing…' : 'Analyse vehicle'}</button></form>
    {message && <p className="message">{message}</p>}
    {result && <section className="result"><div className={`score ${result.report.band.toLowerCase().replaceAll(' ', '-')}`}><span>{result.report.score}</span><strong>{result.report.band}</strong><small>Current MOT risk score</small></div><div><h2>{vehicleName || result.registration}</h2><div className="vehicle-facts"><span>{[result.vehicle.fuelType, result.vehicle.colour].filter(Boolean).join(' · ')}</span><span>Latest MOT: <strong>{result.report.summary.latestResult}</strong></span><span className={`pass-rate ${passRateTone(result.report.summary.passRate)}`}>MOT pass rate: <strong>{result.report.summary.passRate ?? '—'}%</strong></span><span>Latest MOT mileage: {result.report.summary.latestMotMileage?.toLocaleString() || 'not recorded'}</span></div><p className="pass-rate-key">Pass-rate guide: <b className="high-text">80%+ high</b> · <b className="average-text">60–79% average</b> · <b className="low-text">below 60% low</b></p><h3>Current things to check</h3><ul>{result.report.concerns.length ? result.report.concerns.map((concern, index) => <li key={index} className={concern.severity}>{concern.message}</li>) : <li className="good">No current MOT concerns were identified by this screening rule.</li>}</ul>{result.report.repairHistory.length > 0 && <><h3>Earlier failures later followed by a pass</h3><p className="context">These are not scored as current faults. Ask for invoices or an explanation if they affect your decision.</p><ul className="repair-history">{result.report.repairHistory.map(item => <li key={item}>{item}</li>)}</ul></>}{result.aiBriefing && <><h3>Buyer briefing</h3><div className="buyer-briefing">{result.aiBriefing.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></>}{result.fullHistoryCheckUrl && <aside className="full-check"><h3>Before you pay a deposit</h3><p>This MOT report cannot check whether the car is stolen, has outstanding finance, or was written off.</p><a href={result.fullHistoryCheckUrl} target="_blank" rel="sponsored noopener noreferrer">Run a full stolen, finance &amp; write-off check ↗</a><small>Affiliate disclosure: we may earn a commission if you purchase through this link. It does not cost you extra.</small></aside>}<h3>Important limits</h3><ul className="limits">{result.report.limitations.map(item => <li key={item}>{item}</li>)}</ul></div></section>}
    <section className="seo-content"><h2>Understand MOT history before you buy</h2><p>An MOT pass only shows that a vehicle met the minimum roadworthiness standard on the day it was tested. MOT Brief helps you read the wider pattern: current advisories, previous MOT failures later followed by a pass, and recorded mileage consistency.</p><div className="guide-links"><a href="/how-to-read-mot-history">How to read MOT history</a><a href="/mot-advisories-explained">What MOT advisories mean</a><a href="/buying-car-with-mot-failures">Buying a car with MOT failures</a></div><h2>Frequently asked questions</h2><details><summary>Is this an official DVSA service?</summary><p>No. MOT Brief is an independent tool that analyses MOT history returned from the DVSA MOT History API.</p></details><details><summary>Can MOT history tell me whether a car is good?</summary><p>It can reveal useful patterns, but it cannot prove mechanical condition. Inspect the car and consider an independent pre-purchase inspection.</p></details><details><summary>Does this check stolen status, finance or write-offs?</summary><p>No. Those checks need a separate vehicle-history provider.</p></details></section><p className="fine">Independent MOT-history screening tool — always inspect the car, confirm its VIN/V5C, and consider a professional pre-purchase inspection.</p></main>;
}
