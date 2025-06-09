"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Thermometer,
  Scissors,
  Bandage,
  Shield,
  Info,
  Download,
  Printer,
  Heart,
  Phone,
  Stethoscope,
  Pill,
  Zap,
  Eye,
  Droplet,
  Shirt,
  Clock,
  Star,
  Home,
  Car,
  Briefcase,
  Building2,
  ExternalLink,
  ShoppingCart,
  Truck,
  Package2,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";

const FirstAidBoxPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("home");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [maintenanceData, setMaintenanceData] = useState({
    lastCheck: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    nextCheck: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 150 days from now
    expiringItems: 3,
    usageLog: [],
    autoOrderEnabled: false,
    reminderSet: false
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('overview');
  const [itemUsageLog, setItemUsageLog] = useState([
    { id: 1, item: 'Bandages', date: '2024-11-15', quantity: 5, reason: 'Kitchen accident' },
    { id: 2, item: 'Antiseptic', date: '2024-11-10', quantity: 1, reason: 'Cut treatment' },
    { id: 3, item: 'Pain Relief', date: '2024-11-05', quantity: 2, reason: 'Headache' }
  ]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [expiryItems, setExpiryItems] = useState([
    { id: 1, item: 'Pain Relief Medicine', expiry: '2024-12-15', status: 'warning' },
    { id: 2, item: 'Antiseptic Wipes', expiry: '2024-12-20', status: 'warning' },
    { id: 3, item: 'Bandages', expiry: '2025-03-15', status: 'good' }
  ]);

  const toggleChecked = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const categories = [
    { id: "home", label: "Home", icon: Home, color: "text-blue-600" },
    { id: "car", label: "Car", icon: Car, color: "text-green-600" },
    { id: "office", label: "Office", icon: Briefcase, color: "text-purple-600" },
    { id: "travel", label: "Travel", icon: Building2, color: "text-orange-600" },
  ];

  const firstAidItems = {
    home: {
      essential: [
        { id: "bandages", name: "Adhesive Bandages (Various Sizes)", quantity: "20-30 pieces", priority: "high" },
        { id: "gauze", name: "Sterile Gauze Pads", quantity: "10 pieces (2x2, 4x4 inch)", priority: "high" },
        { id: "tape", name: "Medical Tape", quantity: "2 rolls", priority: "high" },
        { id: "antiseptic", name: "Antiseptic Wipes/Solution", quantity: "20 wipes", priority: "high" },
        { id: "thermometer", name: "Digital Thermometer", quantity: "1 piece", priority: "high" },
        { id: "gloves", name: "Disposable Gloves", quantity: "10 pairs", priority: "high" },
        { id: "scissors", name: "Medical Scissors", quantity: "1 piece", priority: "medium" },
        { id: "tweezers", name: "Tweezers", quantity: "1 piece", priority: "medium" },
      ],
      medications: [
        { id: "pain_relief", name: "Pain Relievers (Paracetamol/Ibuprofen)", quantity: "1 bottle each", priority: "high" },
        { id: "antihistamine", name: "Antihistamine (Allergy relief)", quantity: "1 box", priority: "medium" },
        { id: "antacid", name: "Antacid Tablets", quantity: "1 pack", priority: "low" },
        { id: "hydrocortisone", name: "Hydrocortisone Cream (1%)", quantity: "1 tube", priority: "medium" },
      ],
      emergency: [
        { id: "instant_cold", name: "Instant Cold Compress", quantity: "2 pieces", priority: "medium" },
        { id: "emergency_blanket", name: "Emergency Blanket", quantity: "1 piece", priority: "medium" },
        { id: "flashlight", name: "Small Flashlight", quantity: "1 piece", priority: "low" },
        { id: "emergency_numbers", name: "Emergency Contact List", quantity: "1 laminated card", priority: "high" },
      ]
    },
    car: {
      essential: [
        { id: "car_bandages", name: "Adhesive Bandages", quantity: "15 pieces", priority: "high" },
        { id: "car_gauze", name: "Sterile Gauze Pads", quantity: "5 pieces", priority: "high" },
        { id: "car_tape", name: "Medical Tape", quantity: "1 roll", priority: "high" },
        { id: "car_antiseptic", name: "Antiseptic Wipes", quantity: "10 wipes", priority: "high" },
        { id: "car_gloves", name: "Disposable Gloves", quantity: "5 pairs", priority: "high" },
        { id: "car_scissors", name: "Small Scissors", quantity: "1 piece", priority: "medium" },
      ],
      emergency: [
        { id: "reflective_vest", name: "Reflective Safety Vest", quantity: "1 piece", priority: "high" },
        { id: "emergency_triangles", name: "Emergency Warning Triangles", quantity: "2 pieces", priority: "high" },
        { id: "car_blanket", name: "Emergency Blanket", quantity: "1 piece", priority: "medium" },
        { id: "car_flashlight", name: "Emergency Flashlight", quantity: "1 piece", priority: "medium" },
        { id: "whistle", name: "Emergency Whistle", quantity: "1 piece", priority: "low" },
      ],
      medications: [
        { id: "car_pain_relief", name: "Pain Relievers", quantity: "Travel pack", priority: "medium" },
        { id: "motion_sickness", name: "Motion Sickness Pills", quantity: "1 pack", priority: "low" },
      ]
    },
    office: {
      essential: [
        { id: "office_bandages", name: "Adhesive Bandages", quantity: "20 pieces", priority: "high" },
        { id: "office_gauze", name: "Sterile Gauze Pads", quantity: "8 pieces", priority: "high" },
        { id: "office_antiseptic", name: "Antiseptic Wipes", quantity: "15 wipes", priority: "high" },
        { id: "office_gloves", name: "Disposable Gloves", quantity: "8 pairs", priority: "high" },
        { id: "burn_gel", name: "Burn Gel/Cool Packs", quantity: "2 pieces", priority: "medium" },
        { id: "eye_wash", name: "Eye Wash Solution", quantity: "1 bottle", priority: "medium" },
      ],
      medications: [
        { id: "office_pain_relief", name: "Pain Relievers", quantity: "1 bottle", priority: "high" },
        { id: "office_antihistamine", name: "Antihistamine", quantity: "1 pack", priority: "medium" },
      ],
      emergency: [
        { id: "aed_access", name: "AED Device Info/Access", quantity: "1 card", priority: "high" },
        { id: "office_emergency_list", name: "Emergency Contacts", quantity: "1 posted list", priority: "high" },
        { id: "cpr_guide", name: "CPR Quick Reference", quantity: "1 laminated card", priority: "medium" },
      ]
    },
    travel: {
      essential: [
        { id: "travel_bandages", name: "Adhesive Bandages", quantity: "10 pieces", priority: "high" },
        { id: "travel_antiseptic", name: "Antiseptic Wipes", quantity: "10 wipes", priority: "high" },
        { id: "travel_gloves", name: "Disposable Gloves", quantity: "3 pairs", priority: "high" },
        { id: "travel_thermometer", name: "Digital Thermometer", quantity: "1 piece", priority: "medium" },
        { id: "sunscreen", name: "Sunscreen (SPF 30+)", quantity: "1 small tube", priority: "medium" },
        { id: "insect_repellent", name: "Insect Repellent", quantity: "1 small bottle", priority: "medium" },
      ],
      medications: [
        { id: "travel_pain_relief", name: "Pain Relievers", quantity: "Travel pack", priority: "high" },
        { id: "travel_antihistamine", name: "Antihistamine", quantity: "Travel pack", priority: "medium" },
        { id: "anti_diarrheal", name: "Anti-diarrheal Medication", quantity: "1 pack", priority: "medium" },
        { id: "rehydration_salts", name: "Oral Rehydration Salts", quantity: "3 sachets", priority: "medium" },
        { id: "prescription_meds", name: "Personal Prescription Medications", quantity: "As needed", priority: "high" },
      ],
      emergency: [
        { id: "travel_insurance", name: "Travel Insurance Info", quantity: "1 card", priority: "high" },
        { id: "emergency_cash", name: "Emergency Cash", quantity: "Small amount", priority: "medium" },
        { id: "travel_contacts", name: "Emergency Contacts List", quantity: "1 card", priority: "high" },
      ]
    }
  };

  const maintenanceTips = [
    {
      icon: Calendar,
      title: "Check Expiry Dates",
      description: "Review all medications and supplies every 6 months",
      priority: "high"
    },
    {
      icon: Thermometer,
      title: "Storage Conditions",
      description: "Store in cool, dry place away from direct sunlight",
      priority: "medium"
    },
    {
      icon: Package,
      title: "Inventory Check",
      description: "Replace used items immediately after use",
      priority: "high"
    },
    {
      icon: Shield,
      title: "Waterproof Container",
      description: "Use sealed containers to protect from moisture",
      priority: "medium"
    }
  ];

  const exportChecklist = () => {
    const currentItems = firstAidItems[selectedCategory as keyof typeof firstAidItems];
    const allItems = [
      ...currentItems.essential,
      ...currentItems.medications,
      ...currentItems.emergency
    ];
    
    const checklist = allItems.map(item => 
      `${checkedItems.has(item.id) ? '✓' : '☐'} ${item.name} (${item.quantity})`
    ).join('\n');
    
    const blob = new Blob([checklist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `first-aid-checklist-${selectedCategory}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printChecklist = () => {
    const currentItems = firstAidItems[selectedCategory as keyof typeof firstAidItems];
    const allItems = [
      ...currentItems.essential,
      ...currentItems.medications,
      ...currentItems.emergency
    ];
    
    const printContent = `
      <html>
        <head><title>First Aid Box Checklist - ${selectedCategory}</title></head>
        <body>
          <h1>First Aid Box Checklist - ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</h1>
          <ul>
            ${allItems.map(item => 
              `<li>☐ ${item.name} (${item.quantity}) - Priority: ${item.priority}</li>`
            ).join('')}
          </ul>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  const currentItems = firstAidItems[selectedCategory as keyof typeof firstAidItems];
  const totalItems = Object.values(currentItems).flat().length;
  const checkedCount = Object.values(currentItems).flat().filter(item => checkedItems.has(item.id)).length;

  const ProductCard = ({ item, isChecked, onToggle }: { 
    item: any; 
    isChecked: boolean; 
    onToggle: () => void;
  }) => {
    const getProductImage = (itemName: string) => {
      // Using placeholder images from picsum for demonstration - replace with actual product images
      const imageMap: { [key: string]: string } = {
        "bandages": "https://images.unsplash.com/photo-1603398938235-e60ed2166449?w=200&h=150&fit=crop",
        "gauze": "https://images.unsplash.com/photo-1576671081837-49000212a370?w=200&h=150&fit=crop",
        "antiseptic": "https://images.unsplash.com/photo-1585435557343-3b092031d4c1?w=200&h=150&fit=crop",
        "thermometer": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop",
        "gloves": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop",
        "scissors": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=150&fit=crop",
        "pain_relief": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop",
        "emergency_blanket": "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=200&h=150&fit=crop"
      };
      
      return imageMap[item.id] || "https://images.unsplash.com/photo-1603398938235-e60ed2166449?w=200&h=150&fit=crop";
    };

    const onlineStores = [
      { name: "1mg", url: `https://www.1mg.com/search/all?name=${encodeURIComponent(item.name)}`, color: "bg-orange-500" },
      { name: "PharmEasy", url: `https://pharmeasy.in/search/all?name=${encodeURIComponent(item.name)}`, color: "bg-teal-500" },
      { name: "Apollo", url: `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(item.name)}`, color: "bg-blue-500" },
      { name: "Netmeds", url: `https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(item.name)}`, color: "bg-green-500" }
    ];

    const quickCommerce = [
      { name: "Blinkit", url: `https://blinkit.com/s/?q=${encodeURIComponent(item.name)}`, color: "bg-yellow-500" },
      { name: "Swiggy", url: `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(item.name)}`, color: "bg-orange-600" },
      { name: "Zepto", url: `https://www.zepto.com/search?query=${encodeURIComponent(item.name)}`, color: "bg-purple-500" }
    ];

    const ecommerce = [
      { name: "Amazon", url: `https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`, color: "bg-gray-800" },
      { name: "Flipkart", url: `https://www.flipkart.com/search?q=${encodeURIComponent(item.name)}`, color: "bg-blue-600" }
    ];

    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all">
        <div className="flex gap-3">
          <img 
            src={getProductImage(item.name)}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1603398938235-e60ed2166449?w=200&h=150&fit=crop";
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <button
                onClick={onToggle}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isChecked
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-slate-300 hover:border-green-400"
                }`}
              >
                {isChecked && <CheckCircle className="w-3 h-3" />}
              </button>
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${
                  isChecked ? "line-through text-slate-400" : "text-slate-800"
                }`}>
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500 mb-2">{item.quantity}</p>
                
                {/* Priority and Alternatives */}
                <div className="flex items-center gap-2 mb-3">
                  <Star className={`w-3 h-3 ${
                    item.priority === "high" ? "text-red-500" : 
                    item.priority === "medium" ? "text-yellow-500" : "text-slate-400"
                  }`} />
                  <span className="text-xs text-slate-400 capitalize">{item.priority}</span>
                  <button className="text-xs text-blue-600 hover:underline ml-auto">
                    View Alternatives
                  </button>
                </div>

                {/* Online Store Links */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                    <Package2 className="w-3 h-3" />
                    <span>Medical Stores:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {onlineStores.map((store) => (
                      <a
                        key={store.name}
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${store.color} hover:opacity-80 transition-opacity`}
                      >
                        {store.name}
                        <ExternalLink className="w-2 h-2" />
                      </a>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-600 mb-1 mt-2">
                    <Truck className="w-3 h-3" />
                    <span>Quick Delivery:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {quickCommerce.map((service) => (
                      <a
                        key={service.name}
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${service.color} hover:opacity-80 transition-opacity`}
                      >
                        {service.name}
                        <ExternalLink className="w-2 h-2" />
                      </a>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-600 mb-1 mt-2">
                    <ShoppingCart className="w-3 h-3" />
                    <span>E-commerce:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ecommerce.map((store) => (
                      <a
                        key={store.name}
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${store.color} hover:opacity-80 transition-opacity`}
                      >
                        {store.name}
                        <ExternalLink className="w-2 h-2" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const setReminder = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setMaintenanceData(prev => ({ ...prev, reminderSet: true }));
          // Set reminder for next check
          const nextCheckDate = new Date(maintenanceData.nextCheck);
          const reminderDate = new Date(nextCheckDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before
          
          if (reminderDate > new Date()) {
            setTimeout(() => {
              new Notification('First Aid Kit Check Reminder', {
                body: 'Your first aid kit is due for inspection in 7 days.',
                icon: '/favicon.ico'
              });
            }, reminderDate.getTime() - Date.now());
          }
          alert('Reminder set successfully!');
        }
      });
    } else {
      alert('Notifications not supported in this browser');
    }
  };

  const configureAutoOrder = () => {
    setMaintenanceData(prev => ({ 
      ...prev, 
      autoOrderEnabled: !prev.autoOrderEnabled 
    }));
    alert(`Auto-order ${!maintenanceData.autoOrderEnabled ? 'enabled' : 'disabled'} successfully!`);
  };

  const performMaintenanceCheck = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextCheck = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setMaintenanceData(prev => ({
      ...prev,
      lastCheck: today,
      nextCheck: nextCheck,
      expiringItems: Math.floor(Math.random() * 5) // Simulate check results
    }));
    
    alert('Maintenance check completed successfully!');
  };

  const logItemUsage = (itemName: string, quantity: number, reason: string) => {
    const newEntry = {
      id: Date.now(),
      item: itemName,
      date: new Date().toISOString().split('T')[0],
      quantity,
      reason
    };
    
    setItemUsageLog(prev => [newEntry, ...prev]);
    alert('Usage logged successfully!');
  };

  const exportMaintenanceReport = () => {
    const report = {
      kitType: selectedCategory,
      lastCheck: maintenanceData.lastCheck,
      nextCheck: maintenanceData.nextCheck,
      totalItems: totalItems,
      checkedItems: checkedCount,
      completionRate: Math.round((checkedCount / totalItems) * 100),
      expiringItems: maintenanceData.expiringItems,
      usageLog: itemUsageLog,
      autoOrderEnabled: maintenanceData.autoOrderEnabled,
      reminderSet: maintenanceData.reminderSet,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `first-aid-maintenance-report-${selectedCategory}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Enhanced Maintenance Portal Component
  const MaintenancePortal = () => {
    const daysUntilNextCheck = Math.ceil((new Date(maintenanceData.nextCheck).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const daysSinceLastCheck = Math.ceil((Date.now() - new Date(maintenanceData.lastCheck).getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <Card className="shadow-lg border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              Smart Maintenance & Tracking Portal
            </div>
            <Button
              onClick={() => setShowMaintenanceModal(true)}
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-300"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800 text-sm">Next Check</h4>
              <p className="text-xs text-blue-600">{daysUntilNextCheck} days</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800 text-sm">Completion</h4>
              <p className="text-xs text-green-600">{Math.round((checkedCount / totalItems) * 100)}%</p>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold text-yellow-800 text-sm">Expiring</h4>
              <p className="text-xs text-yellow-600">{maintenanceData.expiringItems} items</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800 text-sm">Last Check</h4>
              <p className="text-xs text-purple-600">{daysSinceLastCheck} days ago</p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Next Check</h4>
              <p className="text-sm text-slate-600 mb-3">{maintenanceData.nextCheck}</p>
              <Button 
                onClick={setReminder}
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={maintenanceData.reminderSet}
              >
                {maintenanceData.reminderSet ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Reminder Set
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-1" />
                    Set Reminder
                  </>
                )}
              </Button>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Auto Order</h4>
              <p className="text-sm text-slate-600 mb-3">
                {maintenanceData.autoOrderEnabled ? 'Enabled' : 'Setup recurring delivery'}
              </p>
              <Button 
                onClick={configureAutoOrder}
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                {maintenanceData.autoOrderEnabled ? 'Disable' : 'Configure'}
              </Button>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Expiry Alerts</h4>
              <p className="text-sm text-slate-600 mb-3">{maintenanceData.expiringItems} items expiring soon</p>
              <Button 
                onClick={() => {
                  setActiveMaintenanceTab('expiry');
                  setShowMaintenanceModal(true);
                }}
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Usage Log</h4>
              <p className="text-sm text-slate-600 mb-3">{itemUsageLog.length} entries logged</p>
              <Button 
                onClick={() => {
                  setActiveMaintenanceTab('usage');
                  setShowMaintenanceModal(true);
                }}
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Log
              </Button>
            </div>
          </div>

          {/* Enhanced Features */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800">Smart Maintenance Features</h4>
              <div className="flex gap-2">
                <Button
                  onClick={performMaintenanceCheck}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Run Check
                </Button>
                <Button
                  onClick={exportMaintenanceReport}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export Report
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Automatic expiry date tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Usage analytics and reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Smart reorder suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Price comparison across stores</span>
              </div>
            </div>
          </div>
        </CardContent>

            {/* Maintenance Modal */}
            {showMaintenanceModal && (
            <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Maintenance Portal</h3>
                    <Button
                      onClick={() => setShowMaintenanceModal(false)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="border-b">
                    <div className="flex">
                      {[
                        { id: 'overview', label: 'Overview', icon: Eye },
                        { id: 'expiry', label: 'Expiry Tracking', icon: AlertTriangle },
                        { id: 'usage', label: 'Usage Log', icon: Clock },
                        { id: 'analytics', label: 'Analytics', icon: RefreshCw }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveMaintenanceTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                            activeMaintenanceTab === tab.id
                              ? 'border-purple-600 text-purple-600'
                              : 'border-transparent text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
    
                  {/* Tab Content */}
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {activeMaintenanceTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Kit Status</h4>
                            <p className="text-2xl font-bold text-blue-600">{Math.round((checkedCount / totalItems) * 100)}%</p>
                            <p className="text-sm text-blue-600">Complete</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Items Ready</h4>
                            <p className="text-2xl font-bold text-green-600">{checkedCount}</p>
                            <p className="text-sm text-green-600">of {totalItems}</p>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">Action Needed</h4>
                            <p className="text-2xl font-bold text-yellow-600">{maintenanceData.expiringItems}</p>
                            <p className="text-sm text-yellow-600">Expiring items</p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3">Recent Activity</h4>
                          <div className="space-y-2">
                            {itemUsageLog.slice(0, 3).map((log) => (
                              <div key={log.id} className="flex justify-between items-center text-sm">
                                <span>{log.item} used ({log.quantity})</span>
                                <span className="text-slate-500">{log.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
    
                    {activeMaintenanceTab === 'expiry' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">Expiry Tracking</h4>
                          <Button
                            onClick={() => {
                              const item = prompt('Item name:');
                              const expiry = prompt('Expiry date (YYYY-MM-DD):');
                              if (item && expiry) {
                                // Add logic to track expiry items
                                alert(`Added expiry tracking for ${item} (expires: ${expiry})`);
                              }
                            }}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Item
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {expiryItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div>
                                <span className="font-medium">{item.item}</span>
                                <p className="text-sm text-slate-600">Expires: {item.expiry}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.status === 'warning' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {item.status === 'warning' ? 'Expires Soon' : 'Good'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
    
                    {activeMaintenanceTab === 'usage' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">Usage Log</h4>
                          <Button
                            onClick={() => {
                              const item = prompt('Item name:');
                              const quantity = prompt('Quantity used:');
                              const reason = prompt('Reason:');
                              if (item && quantity && reason) {
                                logItemUsage(item, parseInt(quantity), reason);
                              }
                            }}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Entry
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {itemUsageLog.map((log) => (
                            <div key={log.id} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium">{log.item}</span>
                                  <p className="text-sm text-slate-600">Quantity: {log.quantity}</p>
                                  <p className="text-sm text-slate-600">Reason: {log.reason}</p>
                                </div>
                                <span className="text-sm text-slate-500">{log.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
    
                    {activeMaintenanceTab === 'analytics' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Analytics & Insights</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2">Most Used Items</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Bandages</span>
                                <span className="font-medium">8 times</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Antiseptic</span>
                                <span className="font-medium">5 times</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Pain Relief</span>
                                <span className="font-medium">3 times</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-medium text-green-800 mb-2">Reorder Suggestions</h5>
                            <div className="space-y-2 text-sm">
                              <div>• Bandages (running low)</div>
                              <div>• Antiseptic wipes (expiring soon)</div>
                              <div>• Emergency blanket (never used)</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h5 className="font-medium text-purple-800 mb-2">Maintenance Score</h5>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-purple-200 rounded-full h-3">
                              <div 
                                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${85}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-purple-600">85%</span>
                          </div>
                          <p className="text-sm text-purple-600 mt-2">Excellent maintenance record!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      };

  const addCustomItem = () => {
    const name = prompt('Item name:');
    const quantity = prompt('Quantity:');
    const priority = prompt('Priority (high/medium/low):');
    const category = prompt('Category (essential/medications/emergency):');
    
    if (name && quantity && priority && category) {
      const newItem = {
        id: `custom_${Date.now()}`,
        name,
        quantity,
        priority: priority.toLowerCase(),
        category: category.toLowerCase()
      };
      
      setCustomItems(prev => [...prev, newItem]);
      alert('Custom item added successfully!');
    }
  };

  const addExpiryItem = (itemName: string, expiryDate: string) => {
    const newExpiryItem = {
      id: Date.now(),
      item: itemName,
      expiry: expiryDate,
      status: new Date(expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'warning' : 'good'
    };
    
    setExpiryItems(prev => [...prev, newExpiryItem]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 z-10 shadow-sm">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              </Button>
            </Link>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm lg:text-xl text-slate-800 truncate">
                First Aid Box Guide
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                Setup and maintain your emergency kit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportChecklist}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={printChecklist}
              variant="outline"
              size="sm"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                First Aid Box Setup Guide
              </h1>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Build and maintain comprehensive first aid kits for different environments.
              Choose your location type and follow our expert recommendations.
            </p>
          </div>

          {/* Category Selection */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Select First Aid Kit Type
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`p-4 h-auto flex-col gap-2 ${
                      selectedCategory === category.id 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                        : ""
                    }`}
                  >
                    <category.icon className={`w-6 h-6 ${
                      selectedCategory === category.id ? "text-white" : category.color
                    }`} />
                    <span className={selectedCategory === category.id ? "text-white" : ""}>
                      {category.label}
                    </span>
                  </Button>
                ))}
              </div>
              
              {/* Add Custom Item Section */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-800">Custom Items</h4>
                  <Button
                    onClick={addCustomItem}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Custom Item
                  </Button>
                </div>
                {customItems.length > 0 && (
                  <div className="space-y-2">
                    {customItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                        <span>{item.name} ({item.quantity})</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Progress: {checkedCount}/{totalItems} items
                </span>
                <span className="text-sm text-slate-500">
                  {Math.round((checkedCount / totalItems) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedCount / totalItems) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Items Checklist with Images and Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Essential Items */}
            <Card className="shadow-lg">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Essential Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {currentItems.essential.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      isChecked={checkedItems.has(item.id)}
                      onToggle={() => toggleChecked(item.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medications */}
            <Card className="shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {currentItems.medications.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      isChecked={checkedItems.has(item.id)}
                      onToggle={() => toggleChecked(item.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Items */}
            <Card className="shadow-lg">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Emergency Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {currentItems.emergency.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      isChecked={checkedItems.has(item.id)}
                      onToggle={() => toggleChecked(item.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Portal */}
          <MaintenancePortal />
        </div>
      </div>
    </div>
  );
};

export default FirstAidBoxPage;