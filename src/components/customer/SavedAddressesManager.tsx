'use client';

import { useState } from 'react';
import { SavedAddress } from '@/types';
import { Home, Briefcase, MapPin, Plus, Check, CheckCircle2 } from 'lucide-react';

interface SavedAddressesManagerProps {
  savedAddresses: SavedAddress[];
  onSelectAddress: (address: SavedAddress) => void;
  onAddNewAddress: (newAddr: Omit<SavedAddress, 'id' | 'userId'>) => void;
}

export default function SavedAddressesManager({
  savedAddresses,
  onSelectAddress,
  onAddNewAddress,
}: SavedAddressesManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id || (savedAddresses[0]?.id ?? null)
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addressText, setAddressText] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('673602');
  const [instructions, setInstructions] = useState('');

  const getLabelIcon = (lbl: SavedAddress['label']) => {
    switch (lbl) {
      case 'Home':
        return <Home className="w-4 h-4 text-amber-600" />;
      case 'Work':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <MapPin className="w-4 h-4 text-teal-600" />;
    }
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressText.trim()) return;

    onAddNewAddress({
      label,
      address: addressText,
      landmark,
      pincode,
      deliveryInstructions: instructions,
    });

    setAddressText('');
    setLandmark('');
    setInstructions('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-serif font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-600" />
          Saved Locations
        </h4>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
        </button>
      </div>

      {/* SAVED ADDRESS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {savedAddresses.map((addr) => {
          const isSelected = selectedId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => {
                setSelectedId(addr.id);
                onSelectAddress(addr);
              }}
              className={`cursor-pointer p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-sm">
                    {getLabelIcon(addr.label)}
                    {addr.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600 fill-amber-100" />
                  )}
                </div>
                <p className="text-xs font-medium text-slate-800 line-clamp-2">{addr.address}</p>
                {addr.landmark && (
                  <p className="text-[11px] text-slate-500 mt-1">Near: {addr.landmark}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD NEW ADDRESS FORM */}
      {showAddForm && (
        <form onSubmit={handleSaveNew} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-3 text-xs">
          <h5 className="font-semibold text-slate-800">Add New Saved Location</h5>
          <div className="flex gap-2">
            {(['Home', 'Work', 'Other'] as const).map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setLabel(lbl)}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  label === lbl
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Address</label>
            <input
              type="text"
              required
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="House number, Street, Area..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near hospital"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="673602"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Delivery Instructions</label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Leave with security"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition"
          >
            Save Location
          </button>
        </form>
      )}
    </div>
  );
}
