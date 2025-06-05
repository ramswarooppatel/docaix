"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalIndicators } from "@/components/signal-indicators";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  User, 
  Phone, 
  Settings as SettingsIcon,
  Brain,
  MapPin,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const SettingsPage = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'hospitals'>('contacts');

  // Check for tab parameter on mount
  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (hash === '#hospitals' || urlParams.get('tab') === 'hospitals') {
      setActiveTab('hospitals');
    }
  }, []);

  // Helper function to notify other components about contact updates
  const notifyContactsUpdated = () => {
    window.dispatchEvent(new CustomEvent('emergencyContactsUpdated'));
  };

  // Load contacts from localStorage on component mount
  useEffect(() => {
    const loadContacts = () => {
      try {
        const savedContacts = localStorage.getItem("emergencyContacts");
        console.log('Loading contacts from localStorage:', savedContacts);
        
        if (savedContacts && savedContacts !== 'undefined') {
          const parsedContacts = JSON.parse(savedContacts);
          console.log('Parsed contacts:', parsedContacts);
          
          if (Array.isArray(parsedContacts)) {
            setContacts(parsedContacts);
          } else {
            console.warn('Contacts data is not an array, resetting');
            setContacts([]);
            localStorage.setItem("emergencyContacts", JSON.stringify([]));
          }
        } else {
          console.log('No contacts found in localStorage, starting fresh');
          setContacts([]);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        setContacts([]);
        localStorage.removeItem("emergencyContacts");
      } finally {
        setIsLoaded(true);
      }
    };

    if (typeof window !== 'undefined') {
      loadContacts();
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      console.log('Saving contacts to localStorage:', contacts);
      localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
      notifyContactsUpdated();
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  }, [contacts, isLoaded]);

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
    };

    console.log('Adding new contact:', newContact);
    setContacts(prev => {
      const updated = [...prev, newContact];
      console.log('Updated contacts array:', updated);
      return updated;
    });
    
    setNewName("");
    setNewPhone("");
    setShowAddForm(false);
  };

  const deleteContact = (id: string) => {
    console.log('Deleting contact with id:', id);
    setContacts(prev => {
      const updated = prev.filter(contact => contact.id !== id);
      console.log('Updated contacts after deletion:', updated);
      return updated;
    });
  };

  const startEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setEditName(contact.name);
    setEditPhone(contact.phone);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editPhone.trim()) return;

    console.log('Saving edit for contact:', editingId);
    setContacts(prev => {
      const updated = prev.map(contact => 
        contact.id === editingId 
          ? { ...contact, name: editName.trim(), phone: editPhone.trim() }
          : contact
      );
      console.log('Updated contacts after edit:', updated);
      return updated;
    });

    setEditingId(null);
    setEditName("");
    setEditPhone("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPhone("");
  };

  // Open Google Maps URL for hospitals
  const openHospitalMaps = () => {
    const googleMapsURL = "https://maps.app.goo.gl/NHbFRyMVtQGV1DbM7";
    window.open(googleMapsURL, "_blank");
  };

  // Show loading state while data is being loaded
  if (!isLoaded) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 z-10 shadow-sm">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-xl text-slate-800 truncate">
                Settings
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">Emergency Configuration</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <SignalIndicators className="scale-75 sm:scale-100" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Emergency Contacts
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'hospitals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Nearby Hospitals
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {activeTab === 'contacts' ? (
            /* Emergency Contacts Section */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Emergency Contacts</h2>
                </div>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contact
                </Button>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Add trusted contacts who will receive emergency messages when you use the SOS alert button.
              </p>

              {/* Add Contact Form */}
              {showAddForm && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Add New Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Input
                      placeholder="Contact Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      placeholder="Phone Number"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addContact}
                      disabled={!newName.trim() || !newPhone.trim()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save Contact
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAddForm(false);
                        setNewName("");
                        setNewPhone("");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Contacts List */}
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No emergency contacts added yet.</p>
                  <p className="text-xs mt-1">Add contacts to enable SOS emergency alerts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      {editingId === contact.id ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-sm">
                            {contact.name}
                          </h3>
                          <p className="text-slate-600 text-xs">{contact.phone}</p>
                        </div>
                      )}

                      <div className="flex gap-1 ml-3">
                        {editingId === contact.id ? (
                          <>
                            <Button
                              onClick={saveEdit}
                              size="sm"
                              variant="outline"
                              className="p-1.5 h-7 w-7"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              size="sm"
                              variant="outline"
                              className="p-1.5 h-7 w-7"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => startEdit(contact)}
                              size="sm"
                              variant="outline"
                              className="p-1.5 h-7 w-7"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => deleteContact(contact.id)}
                              size="sm"
                              variant="outline"
                              className="p-1.5 h-7 w-7 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm font-medium mb-1">
                  📱 How Emergency Alerts Work
                </p>
                <p className="text-blue-600 text-xs leading-relaxed">
                  When you tap the SOS button, all contacts will receive an SMS with your location, 
                  timestamp, and emergency message. Make sure to add trusted contacts who can respond quickly.
                </p>
              </div>
            </div>
          ) : (
            /* Hospital Finder Section */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Nearby Hospitals</h2>
                </div>
                <Button
                  onClick={openHospitalMaps}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Maps
                </Button>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Find nearby hospitals and emergency medical centers using Google Maps.
              </p>

              {/* Hospital Maps Integration */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 rounded-lg p-6 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-red-600" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Hospital Locator
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    Click the button below to open Google Maps with nearby hospitals and emergency medical centers.
                    This will show real-time information including directions, contact details, and operating hours.
                  </p>
                  
                  <Button
                    onClick={openHospitalMaps}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Hospitals Near Me
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">🏥 Hospital Information</h4>
                    <ul className="text-blue-700 text-xs space-y-1">
                      <li>• Real-time operating hours</li>
                      <li>• Contact phone numbers</li>
                      <li>• Distance from your location</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2 text-sm">🗺️ Navigation Features</h4>
                    <ul className="text-green-700 text-xs space-y-1">
                      <li>• Turn-by-turn directions</li>
                      <li>• Traffic conditions</li>
                      <li>• Multiple route options</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Emergency Note */}
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">
                  🚨 For life-threatening emergencies, call 108 or 112 immediately instead of traveling to a hospital.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;