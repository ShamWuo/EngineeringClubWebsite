'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitCompetitionRequest } from '@/actions/competitions';
import { submitFundingRequest } from '@/actions/funding';
import { submitTeamRequest } from '@/actions/teams';
import { submitWorkshopRequest } from '@/actions/workshops';
import { submitGeneralRequest } from '@/actions/general-requests';
import { Trophy, DollarSign, Users, Lightbulb, HelpCircle, Plus, Trash2, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

type RequestType = 'competition' | 'funding' | 'team' | 'workshop' | 'general';

interface UniversalRequestFormProps {
  competitions: { id: string; name: string }[];
  teams: { id: string; name: string; competitionName: string }[];
}

export function UniversalRequestForm({ competitions, teams }: UniversalRequestFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramType = (searchParams.get('type') as RequestType) || 'general';

  const [activeType, setActiveType] = useState<RequestType>(
    ['competition', 'funding', 'team', 'workshop', 'general'].includes(paramType) ? paramType : 'general'
  );

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Competition Form State
  const [compName, setCompName] = useState('');
  const [compOrganizer, setCompOrganizer] = useState('');
  const [compUrl, setCompUrl] = useState('');
  const [compWhy, setCompWhy] = useState('');
  const [compCost, setCompCost] = useState('');
  const [compTeamSize, setCompTeamSize] = useState('8');
  const [compDeadline, setCompDeadline] = useState('');

  // 2. Funding Form State
  const [fundTitle, setFundTitle] = useState('');
  const [fundTeamId, setFundTeamId] = useState(teams[0]?.id || '');
  const [fundJustification, setFundJustification] = useState('');
  const [lineItems, setLineItems] = useState([
    { id: '1', description: '', vendor: '', unit_cost_cents: 0, quantity: 1, url: '' },
  ]);

  // 3. Team Form State
  const [teamCompId, setTeamCompId] = useState(competitions[0]?.id || '');
  const [teamProposedName, setTeamProposedName] = useState('');
  const [teamPurpose, setTeamPurpose] = useState('');
  const [teamNeedsFunding, setTeamNeedsFunding] = useState(false);

  // 4. Workshop Form State
  const [workshopTopic, setWorkshopTopic] = useState('');
  const [workshopRationale, setWorkshopRationale] = useState('');
  const [workshopTeach, setWorkshopTeach] = useState(false);
  const [workshopTimeframe, setWorkshopTimeframe] = useState('');

  // 5. General Form State
  const [genTitle, setGenTitle] = useState('');
  const [genCategory, setGenCategory] = useState<'equipment' | 'tool_access' | 'sponsorship' | 'mentorship' | 'general'>('equipment');
  const [genDescription, setGenDescription] = useState('');
  const [genUrgency, setGenUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Line item helpers
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Math.random().toString(), description: '', vendor: '', unit_cost_cents: 0, quantity: 1, url: '' },
    ]);
  };

  const removeLineItem = (idx: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: string, value: any) => {
    const next = [...lineItems];
    next[idx] = { ...next[idx], [field]: value };
    setLineItems(next);
  };

  const totalFundingCents = lineItems.reduce(
    (sum, item) => sum + (Number(item.unit_cost_cents) || 0) * (Number(item.quantity) || 1),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        if (activeType === 'competition') {
          const res = await submitCompetitionRequest({
            name: compName,
            organizer: compOrganizer || null,
            url: compUrl || null,
            why: compWhy,
            estimated_cost_cents: Math.round(parseFloat(compCost || '0') * 100),
            estimated_team_size: parseInt(compTeamSize) || 8,
            deadline: compDeadline || null,
          });
          if (!res.ok) throw new Error(res.error);
          setSuccess('Competition proposal submitted for officer review!');
        } else if (activeType === 'funding') {
          const res = await submitFundingRequest({
            title: fundTitle,
            team_id: fundTeamId || null,
            competition_id: null,
            justification: fundJustification,
            line_items: lineItems.map((item) => ({
              description: item.description,
              vendor: item.vendor || null,
              unit_cost_cents: item.unit_cost_cents,
              quantity: item.quantity,
              url: item.url || null,
            })),
          });
          if (!res.ok) throw new Error(res.error);
          setSuccess('Funding procurement request submitted!');
        } else if (activeType === 'team') {
          const res = await submitTeamRequest({
            competition_id: teamCompId,
            proposed_name: teamProposedName,
            purpose: teamPurpose,
            proposed_member_ids: [],
            needs_funding: teamNeedsFunding,
          });
          if (!res.ok) throw new Error(res.error);
          setSuccess('Subteam formation request submitted!');
        } else if (activeType === 'workshop') {
          const res = await submitWorkshopRequest({
            topic: workshopTopic,
            rationale: workshopRationale,
            offering_to_teach: workshopTeach,
            preferred_timeframe: workshopTimeframe || null,
          });
          if (!res.ok) throw new Error(res.error);
          setSuccess('Workshop proposal submitted!');
        } else if (activeType === 'general') {
          const res = await submitGeneralRequest({
            title: genTitle,
            category: genCategory,
            description: genDescription,
            urgency: genUrgency,
          });
          if (!res.ok) throw new Error(res.error);
          setSuccess('General request submitted to club leadership!');
        }

        setTimeout(() => {
          router.push('/requests');
        }, 800);
      } catch (err: any) {
        setError(err?.message || 'Failed to submit request.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
        <button
          type="button"
          onClick={() => { setActiveType('competition'); setError(null); }}
          className={`p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeType === 'competition'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Competition</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveType('funding'); setError(null); }}
          className={`p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeType === 'funding'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Funding / Parts</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveType('team'); setError(null); }}
          className={`p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeType === 'team'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Subteam</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveType('workshop'); setError(null); }}
          className={`p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeType === 'workshop'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Workshop</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveType('general'); setError(null); }}
          className={`p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer col-span-2 sm:col-span-1 ${
            activeType === 'general'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Equipment / Other</span>
        </button>
      </div>

      <Card className="border-zinc-800 bg-zinc-950 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-zinc-850 pb-4">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              {activeType === 'competition' && <>🏆 Propose a New Competition</>}
              {activeType === 'funding' && <>💰 Procurement & Funding Request</>}
              {activeType === 'team' && <>👥 Form a New Competition Subteam</>}
              {activeType === 'workshop' && <>💡 Propose a Technical Workshop</>}
              {activeType === 'general' && <>🛠️ Equipment, Tools & General Request</>}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              {activeType === 'competition' && 'Submit an engineering competition for club registration, backing, and travel funding.'}
              {activeType === 'funding' && 'Itemize components, sensors, raw stock, or tooling needed for team milestones.'}
              {activeType === 'team' && 'Request an official subteam roster under an active club competition.'}
              {activeType === 'workshop' && 'Suggest a hands-on session or volunteer to instruct fellow engineering members.'}
              {activeType === 'general' && 'Request special lab machine time, sponsorships, software licenses, or custom club support.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-950/80 text-red-300 border border-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 text-xs rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* 1. Competition Subform */}
            {activeType === 'competition' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Competition Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Shell Eco-Marathon Americas"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Organizer / Organization
                    </label>
                    <Input
                      placeholder="e.g. Shell / SAE International"
                      value={compOrganizer}
                      onChange={(e) => setCompOrganizer(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Official Competition Website / Rulebook URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={compUrl}
                    onChange={(e) => setCompUrl(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Why should our club participate? (Justification & Goals) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Explain technical learning opportunities, subteam requirements, and student impact..."
                    value={compWhy}
                    onChange={(e) => setCompWhy(e.target.value)}
                    className="w-full text-xs rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Estimated Cost ($ USD)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 2500"
                      value={compCost}
                      onChange={(e) => setCompCost(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Estimated Team Size
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="8"
                      value={compTeamSize}
                      onChange={(e) => setCompTeamSize(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Registration Deadline
                    </label>
                    <Input
                      type="date"
                      value={compDeadline}
                      onChange={(e) => setCompDeadline(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Funding Subform */}
            {activeType === 'funding' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Funding Request Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Titanium Fasteners & Suspension Rod Ends"
                      value={fundTitle}
                      onChange={(e) => setFundTitle(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Associated Subteam
                    </label>
                    <select
                      value={fundTeamId}
                      onChange={(e) => setFundTeamId(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="">General Club / Independent Project</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.competitionName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Justification & Technical Need *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Why are these items critical? What technical milestone do they unlock?"
                    value={fundJustification}
                    onChange={(e) => setFundJustification(e.target.value)}
                    className="w-full text-xs rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Line items builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Itemized Line Items
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">
                      Total: ${(totalFundingCents / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {lineItems.map((item, idx) => (
                      <div key={item.id} className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-850 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-6">
                            <Input
                              required
                              placeholder="Item description (e.g. 400V Contactor)"
                              value={item.description}
                              onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                              className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <Input
                              placeholder="Vendor (e.g. Mouser)"
                              value={item.vendor}
                              onChange={(e) => updateLineItem(idx, 'vendor', e.target.value)}
                              className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Unit Cost ($)"
                              value={item.unit_cost_cents ? (item.unit_cost_cents / 100).toString() : ''}
                              onChange={(e) => updateLineItem(idx, 'unit_cost_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                              className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white"
                            />
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              disabled={lineItems.length <= 1}
                              className="p-1.5 text-zinc-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLineItem}
                    className="w-full text-xs h-8 border-dashed border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Another Line Item</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 3. Team Subform */}
            {activeType === 'team' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Parent Competition *
                    </label>
                    <select
                      value={teamCompId}
                      onChange={(e) => setTeamCompId(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                    >
                      {competitions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Proposed Team Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. FHS Knights Autonomous Navigation"
                      value={teamProposedName}
                      onChange={(e) => setTeamProposedName(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Team Mission & Subsystem Focus *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe engineering scope, subsystem boundaries, CAD/PCB tools to be used, and goals..."
                    value={teamPurpose}
                    onChange={(e) => setTeamPurpose(e.target.value)}
                    className="w-full text-xs rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <input
                    type="checkbox"
                    id="needsFunding"
                    checked={teamNeedsFunding}
                    onChange={(e) => setTeamNeedsFunding(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="needsFunding" className="text-xs text-zinc-300 cursor-pointer">
                    This subteam will require dedicated club procurement funding this season
                  </label>
                </div>
              </div>
            )}

            {/* 4. Workshop Subform */}
            {activeType === 'workshop' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Workshop Topic Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. High-Speed PCB Layout & Differential Routing in KiCad"
                    value={workshopTopic}
                    onChange={(e) => setWorkshopTopic(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Why is this valuable to club members? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="What skills will members take away? What real-world tools will be demonstrated?"
                    value={workshopRationale}
                    onChange={(e) => setWorkshopRationale(e.target.value)}
                    className="w-full text-xs rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <input
                      type="checkbox"
                      id="teachToggle"
                      checked={workshopTeach}
                      onChange={(e) => setWorkshopTeach(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-red-600 focus:ring-red-600"
                    />
                    <label htmlFor="teachToggle" className="text-xs text-zinc-300 cursor-pointer">
                      I volunteer to teach or co-instruct this workshop
                    </label>
                  </div>
                  <div>
                    <Input
                      placeholder="Preferred timeframe (e.g. Next Tuesday 6 PM)"
                      value={workshopTimeframe}
                      onChange={(e) => setWorkshopTimeframe(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. General Subform */}
            {activeType === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Request Summary / Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Access to CNC Waterjet Cutter or Markforged Onyx"
                      value={genTitle}
                      onChange={(e) => setGenTitle(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Category
                    </label>
                    <select
                      value={genCategory}
                      onChange={(e) => setGenCategory(e.target.value as any)}
                      className="w-full h-10 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="equipment">Makerspace & Heavy Equipment</option>
                      <option value="tool_access">Software License / Tool Key Access</option>
                      <option value="sponsorship">Corporate Sponsorship / Industry Contact</option>
                      <option value="mentorship">Faculty / Graduate Student Mentorship</option>
                      <option value="general">Other Special Club Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Detailed Request Description & Justification *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe exactly what you need, how it will be used, target milestones, and timeline..."
                    value={genDescription}
                    onChange={(e) => setGenDescription(e.target.value)}
                    className="w-full text-xs rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['low', 'medium', 'high', 'critical'] as const).map((urg) => (
                      <button
                        key={urg}
                        type="button"
                        onClick={() => setGenUrgency(urg)}
                        className={`p-2 rounded-lg text-xs font-bold capitalize transition-all border cursor-pointer ${
                          genUrgency === urg
                            ? 'bg-red-950 text-red-400 border-red-600'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {urg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-zinc-850 pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/requests')}
              className="text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2 text-xs shadow-lg shadow-red-950/60"
            >
              <span>{isPending ? 'Submitting to Officers...' : 'Submit Request'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
