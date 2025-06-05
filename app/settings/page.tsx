"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalIndicators } from "@/components/ui/signal-indicators";
import { HospitalFinder } from "@/components/HospitalFinder";
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
  MapPin
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Emergency Contacts</h2>
                <Button
                  onClick={() => setShowAddForm(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contact
                </Button>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Add emergency contacts who will receive alerts when you use the emergency messaging feature.
              </p>

              {/* Add Contact Form */}
              {showAddForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Add New Contact</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <Input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Contact name"
                        className="w-full"
                        onKeyDown={(e) => e.key === "Enter" && addContact()}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <Input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full"
                        onKeyDown={(e) => e.key === "Enter" && addContact()}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={addContact}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!newName.trim() || !newPhone.trim()}
                      >
                        <Save className="w-4 h-4 mr-1" />
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
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contacts List */}
              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No emergency contacts added yet.</p>
                    <p className="text-xs mt-1">Add contacts to receive emergency alerts.</p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>

                      {editingId === contact.id ? (
                        // Edit Mode
                        <div className="flex-1 space-y-2">
                          <Input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Contact name"
                            className="w-full h-8 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                          />
                          <Input
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="Phone number"
                            className="w-full h-8 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={saveEdit}
                              size="sm"
                              className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                              disabled={!editName.trim() || !editPhone.trim()}
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{contact.name}</p>
                            <p className="text-sm text-slate-600 truncate">{contact.phone}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => startEdit(contact)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteContact(contact.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Contact Count */}
              {contacts.length > 0 && (
                <div className="mt-4 text-center text-sm text-slate-600">
                  {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''} configured
                </div>
              )}
            </div>
          ) : (
            /* Hospital Finder Section */
            <HospitalFinder />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;