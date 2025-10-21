import { 
    APP_VERSIONS, 
    RECOVERY_FACTS, 
    literatureData, 
    journalTemplates as exportedJournalTemplates, // Rename to avoid conflict
    copingStrategies, 
    MEETING_LINKS 
} from './data.js';

import { 
    BookOpenIcon, TargetIcon, LifeBuoyIcon, ClipboardListIcon, ShieldIcon, 
    ArrowLeftIcon, TrashIcon, SparklesIcon, CheckCircleIcon, LibraryIcon, 
    DownloadIcon, EditIcon, ChevronDown, ChevronUp, CheckIcon, SettingsIcon, 
    MapPinIcon, PhoneIcon, XIcon, FileTextIcon 
} from './icons.js';

// FIX: Explicitly access React from the global scope when running as a module.
// In a non-module <script> tag, React is globally defined. In a module, we must define it here.
const React = window.React;
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// Re-assigning journalTemplates to maintain structure clarity in this file
const journalTemplates = exportedJournalTemplates;

// Mapping the string icon names in copingStrategies back to the actual React components
const iconMap = {
    MapPinIcon: MapPinIcon,
    PhoneIcon: PhoneIcon,
    ShieldIcon: ShieldIcon,
};
const allCopingCards = copingStrategies.map(card => ({
    ...card,
    icon: iconMap[card.icon] || ShieldIcon // Default to ShieldIcon if not found
}));


// --- LOCAL STORAGE UTILITIES ---
const LocalDataStore = {
    KEYS: { 
        SOBRIETY: 'recovery_sobriety_date', 
        JOURNAL: 'recovery_journal_entries', 
        GOALS: 'recovery_goals', 
        WORKBOOK: 'recovery_workbook_responses', 
        WELCOME_TIP: 'recovery_welcome_tip_dismissed'
    },
    load: (key) => {
        try {
            const serializedData = localStorage.getItem(key);
            if (key === LocalDataStore.KEYS.SOBRIETY) {
                return serializedData === null ? null : JSON.parse(serializedData);
            }
            if (key === LocalDataStore.KEYS.WELCOME_TIP) {
                return serializedData === 'true';
            }
            return serializedData === null ? [] : JSON.parse(serializedData);
        } catch (error) {
            console.error(`Error loading data from localStorage for key ${key}:`, error);
            return key === LocalDataStore.KEYS.SOBRIETY ? null : (key === LocalDataStore.KEYS.WELCOME_TIP ? false : []);
        }
    },
    save: (key, data) => {
        try {
            const dataToStore = key === LocalDataStore.KEYS.SOBRIETY || key === LocalDataStore.KEYS.WELCOME_TIP
                ? data : JSON.stringify(data);
            localStorage.setItem(key, dataToStore);
        } catch (error) {
            console.error(`Error saving data to localStorage for key ${key}:`, error);
        }
    },
    // Collects all relevant data for export
    loadAll: () => {
        const allData = {};
        for (const key in LocalDataStore.KEYS) {
            if (LocalDataStore.KEYS[key] !== LocalDataStore.KEYS.WELCOME_TIP) {
                 const rawData = localStorage.getItem(LocalDataStore.KEYS[key]);
                 if (rawData) {
                     // Try to parse if it's not the raw sobriety date string
                     try {
                         allData[LocalDataStore.KEYS[key]] = JSON.parse(rawData);
                     } catch {
                         allData[LocalDataStore.KEYS[key]] = rawData;
                     }
                 }
            }
        }
        return allData;
    },
    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
};

// --- HOOK: useAuth (Simplified) ---
const useAuth = () => {
    const user = useMemo(() => ({ uid: 'local_user_id' }), []);
    return { user, isAuthLoading: false };
};

// --- COMPONENT: Spinner ---
const Spinner = ({ small = false }) => ( React.createElement("div", { className: `flex justify-center items-center ${small ? '' : 'h-full'}` }, React.createElement("div", { className: `animate-spin rounded-full border-t-2 border-b-2 border-teal-500 ${small ? 'h-6 w-6' : 'h-16 w-16'}` })));

// --- COMPONENT: SobrietyDataSetup ---
const SobrietyDataSetup = ({ onDateSet }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const handleSave = () => {
        const newStartDate = new Date(date);
        LocalDataStore.save(LocalDataStore.KEYS.SOBRIETY, newStartDate.toISOString());
        // Set the welcome tip to be visible for new users
        LocalDataStore.save(LocalDataStore.KEYS.WELCOME_TIP, 'false');
        onDateSet(newStartDate);
    };
    return ( React.createElement("div", { className: "flex flex-col items-center justify-center h-full p-6 bg-gray-50 rounded-xl shadow-lg animate-fade-in" }, React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-2" }, "Welcome"), React.createElement("p", { className: "text-gray-600 mb-6 text-center" }, "Let's start your journey. Please select your sobriety start date."), React.createElement("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-full max-w-xs p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" }), React.createElement("button", { onClick: handleSave, className: "mt-6 bg-teal-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-teal-700 transition-transform transform hover:scale-105" }, "Begin Journey")) );
};

// --- COMPONENT: SobrietyTracker ---
const SobrietyTracker = ({ startDate }) => {
    const calculateTimeSober = () => {
        const diff = new Date().getTime() - new Date(startDate).getTime();
        return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) };
    };
    const [timeSober, setTimeSober] = useState(calculateTimeSober());
    useEffect(() => { const timer = setInterval(() => setTimeSober(calculateTimeSober()), 1000); return () => clearInterval(timer); }, [startDate]);
    const timeUnits = [ { label: 'Days', value: timeSober.days }, { label: 'Hours', value: timeSober.hours }, { label: 'Minutes', value: timeSober.minutes }, { label: 'Seconds', value: timeSober.seconds } ];
    return ( React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg text-center" }, React.createElement("h3", { className: "text-lg font-semibold text-gray-500 mb-4" }, "You are on your path"), React.createElement("div", { className: "grid grid-cols-4 gap-2 sm:gap-4" }, timeUnits.map(unit => ( React.createElement("div", { key: unit.label, className: "flex flex-col items-center bg-gray-100 p-2 sm:p-3 rounded-lg" }, React.createElement("span", { className: "text-3xl sm:text-4xl font-bold text-teal-600" }, String(unit.value).padStart(2, '0')), React.createElement("span", { className: "text-xs sm:text-sm text-gray-600 uppercase tracking-wider" }, unit.label)))))) );
};

// --- COMPONENT: WelcomeTip (New Onboarding Component) ---
const WelcomeTip = ({ onDismiss }) => {
    return (
        React.createElement("div", { className: "p-4 bg-blue-100 border border-blue-300 rounded-xl shadow-md flex justify-between items-start mb-6" },
            React.createElement("div", { className: "flex-grow pr-4" },
                React.createElement("p", { className: "font-bold text-blue-800 mb-1" }, "Welcome to Recovery"),
                React.createElement("p", { className: "text-sm text-blue-700" }, "You'll see terms like ", React.createElement("strong", null, "HALT"), " (Hungry, Angry, Lonely, Tired) and ", React.createElement("strong", null, "Inventory"), " (self-reflection). Don't worry if they're new\u2014the Workbook and Journal are here to guide you.")
            ),
            React.createElement("button", { 
                onClick: onDismiss, 
                className: "text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-200 transition-colors flex-shrink-0", 
                "aria-label": "Dismiss welcome tip" 
            }, React.createElement(XIcon, null))
        )
    );
};


// --- COMPONENT: Dashboard ---
const Dashboard = ({ onNavigate, sobrietyStartDate }) => {
    // Select a random fact on component render
    const randomFact = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * RECOVERY_FACTS.length);
        return RECOVERY_FACTS[randomIndex];
    }, []);
    
    // State for Onboarding Tip
    const [isTipDismissed, setIsTipDismissed] = useState(LocalDataStore.load(LocalDataStore.KEYS.WELCOME_TIP));

    const handleDismissTip = () => {
        LocalDataStore.save(LocalDataStore.KEYS.WELCOME_TIP, 'true');
        setIsTipDismissed(true);
    };

    const menuItems = [
        { view: 'journal', label: 'Daily Journal', icon: React.createElement(BookOpenIcon, null) },
        { view: 'goals', label: 'My Goals', icon: React.createElement(TargetIcon, null) },
        { view: 'coping', label: 'Coping Cards', icon: React.createElement(ShieldIcon, null) },
        { view: 'workbook', label: 'Recovery Workbook', icon: React.createElement(ClipboardListIcon, null) },
        { view: 'literature', label: 'Recovery Literature', icon: React.createElement(LibraryIcon, null) },
        { view: 'finder', label: 'Meeting Finder', icon: React.createElement(MapPinIcon, null) },
        { view: 'resources', label: 'S.O.S. Resources', icon: React.createElement(LifeBuoyIcon, null) },
    ];
    return ( 
        React.createElement("div", { className: "animate-fade-in space-y-6" },
            // Display Welcome Tip if not dismissed
            !isTipDismissed && React.createElement(WelcomeTip, { onDismiss: handleDismissTip }),
            
            // Display Random Fact
            React.createElement("div", { className: "text-center p-3 bg-yellow-50 rounded-xl shadow-sm border border-yellow-200" },
                React.createElement("p", { className: "text-sm font-medium text-yellow-800 italic" }, "Recovery Insight: ", randomFact)
            ),

            React.createElement(SobrietyTracker, { startDate: sobrietyStartDate }),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                menuItems.map(item => ( 
                    React.createElement("button", { key: item.view, onClick: () => onNavigate(item.view), className: "flex items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all transform hover:-translate-y-1" },
                        React.createElement("div", { className: "text-teal-500 mr-4" }, item.icon),
                        React.createElement("span", { className: "text-lg font-semibold text-gray-700" }, item.label)
                    )
                ))
            )
        ) 
    );
};

// --- COMPONENT: Settings ---
const Settings = ({ currentStartDate, handleSobrietyDateUpdate, onBack }) => {
    const initialDateString = useMemo(() => {
        if (currentStartDate instanceof Date && !isNaN(currentStartDate)) {
            return currentStartDate.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    }, [currentStartDate]);

    const [newDate, setNewDate] = useState(initialDateString);
    const [journalChecked, setJournalChecked] = useState(false);
    const [exporting, setExporting] = useState(false); // NEW State

    const handleSave = () => {
        const updatedDate = new Date(newDate);
        handleSobrietyDateUpdate(updatedDate, journalChecked);
    };
    
    // NEW: Data Export Handler
    const handleExportData = () => {
        setExporting(true);
        const data = LocalDataStore.loadAll();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `recovery_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        setExporting(false);
    };

    return (
        React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg animate-fade-in h-full flex flex-col" },
            React.createElement("button", { onClick: onBack, className: "flex items-center text-teal-600 hover:text-teal-800 mb-6 font-semibold flex-shrink-0" },
                React.createElement(ArrowLeftIcon, null),
                React.createElement("span", { className: "ml-2" }, "Back to Dashboard")
            ),
            
            React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-4" }, "Settings"),
            React.createElement("p", { className: "text-gray-600 mb-6" }, "Manage your core application details."),

            React.createElement("div", { className: "space-y-8" },
                /* Sobriety Date Picker */
                React.createElement("div", { className: "p-4 bg-gray-50 rounded-lg" },
                    React.createElement("label", { className: "block text-sm font-bold text-gray-700 mb-2" }, "Change Sobriety Start Date"),
                    React.createElement("input", {
                        type: "date",
                        value: newDate,
                        onChange: (e) => setNewDate(e.target.value),
                        className: "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                    }),
                    React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "Current Date: ", currentStartDate.toLocaleDateString()),
                    React.createElement("div", { className: "flex items-start mt-4" },
                        React.createElement("input", {
                            id: "journal-change",
                            type: "checkbox",
                            checked: journalChecked,
                            onChange: (e) => setJournalChecked(e.target.checked),
                            className: "h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1"
                        }),
                        React.createElement("label", { htmlFor: "journal-change", className: "ml-3 text-sm text-gray-600 cursor-pointer" },
                            React.createElement("strong", null, "**Journal about this date change?**"),
                            React.createElement("span", { className: "block text-xs text-gray-500" }, "I recommend reflecting on why your sobriety date is being adjusted.")
                        )
                    ),
                    /* Save Button */
                    React.createElement("button", {
                        onClick: handleSave,
                        className: "w-full mt-4 bg-teal-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-teal-700 transition-colors"
                    }, "Update Date")
                ),
                
                /* Data Export Section */
                React.createElement("div", { className: "p-4 bg-yellow-50 rounded-lg border border-yellow-200" },
                    React.createElement("h3", { className: "flex items-center gap-2 text-lg font-bold text-yellow-800 mb-2" }, React.createElement(FileTextIcon, null), " Data Management"),
                    React.createElement("p", { className: "text-sm text-gray-700 mb-4" }, "Export all your data (Journal, Goals, Workbook responses) as a JSON file. This is crucial for backing up your private data as it is ", React.createElement("strong", null, "not stored on a server"), "."),
                    React.createElement("button", {
                        onClick: handleExportData,
                        disabled: exporting,
                        className: "w-full flex items-center justify-center gap-2 bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-yellow-700 transition-colors disabled:bg-gray-400"
                    },
                        exporting ? React.createElement(Spinner, { small: true }) : React.createElement(DownloadIcon, null),
                        exporting ? 'Preparing Data...' : 'Export All Data (.json)'
                    )
                )
            )
        )
    );
};

// --- COMPONENT: GeminiJournalHelper (JSX converted to React.createElement for module compatibility) ---
const GeminiJournalHelper = ({ onInsertText, onClose }) => {
    const [prompt, setPrompt] = useState(''); const [isLoading, setIsLoading] = useState(false); const [result, setResult] = useState(''); const [error, setError] = useState('');
    const handleGenerate = async () => {
        if (!prompt.trim()) { setError('Please enter a topic or feeling.'); return; }
        setIsLoading(true); setResult(''); setError('');
        const systemPrompt = "You are a gentle and supportive journaling assistant for someone in recovery... Start the entry naturally, without greetings like 'Dear Journal'.";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemPrompt }] } }) });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const data = await response.json(); const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) setResult(text); else throw new Error("No text returned.");
        } catch (e) { console.error("Gemini API call failed:", e); setError("Sorry, I couldn't generate a response right now."); } finally { setIsLoading(false); }
    };
    return ( React.createElement("div", { className: "p-4 border-t-2 border-teal-100 mt-4 space-y-3" }, React.createElement("p", { className: "text-sm text-gray-600 font-semibold" }, "Need help starting? Give the AI a topic."), React.createElement("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: "e.g., 'Feeling grateful' or 'Anxious about work'...", className: "w-full p-2 border border-gray-300 rounded-lg text-sm", rows: "2" }), React.createElement("button", { onClick: handleGenerate, disabled: isLoading, className: "w-full bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 disabled:bg-gray-400 flex items-center justify-center" }, isLoading ? React.createElement(Spinner, { small: true }) : 'Generate Idea'), error && React.createElement("p", { className: "text-red-500 text-sm" }, error), result && ( React.createElement("div", { className: "p-3 bg-gray-100 rounded-lg space-y-3" }, " ", React.createElement("p", { className: "text-gray-800 text-sm" }, result), " ", React.createElement("button", { onClick: () => { onInsertText(result); onClose(); }, className: "w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600" }, "Use This Entry"), " ") )) );
};

// --- COMPONENT: DebouncedTextarea ---
const DebouncedTextarea = ({ value, onChange, placeholder, rows, isInput = false, isDisabled = false }) => {
    const [localValue, setLocalValue] = useState(value);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value);
        }
    }, [value]);

    useEffect(() => {
        if (localValue === value) {
            return;
        }
        
        const handler = setTimeout(() => {
            onChange(localValue);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [localValue, onChange]);

    const commonProps = {
        value: localValue,
        onChange: handleChange,
        placeholder: placeholder,
        className: `w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 ${isInput ? '' : 'resize-none'} ${isDisabled ? 'bg-gray-100' : ''}`,
        disabled: isDisabled,
    };

    if (isInput) {
         return React.createElement("input", { type: "text", ...commonProps });
    } else {
        return React.createElement("textarea", { rows: rows, ...commonProps });
    }
};


// --- GENERIC MODULES (Journal, Goals) ---
const createListModule = (config) => {
    const storageKey = config.collectionName === 'journal' ? LocalDataStore.KEYS.JOURNAL : LocalDataStore.KEYS.GOALS;

    return ({ journalTemplate, setJournalTemplate }) => {
        const isJournal = config.collectionName === 'journal';
        const [items, setItems] = useState([]);
        const [newItem, setNewItem] = useState('');
        const [editingItem, setEditingItem] = useState(null);
        const [editedText, setEditedText] = useState('');
        const [isLoading, setIsLoading] = useState(true);
        const [showGeminiHelper, setShowGeminiHelper] = useState(false);
        const [selectedTemplateId, setSelectedTemplateId] = useState('');
        
        const [isEditingExisting, setIsEditingExisting] = useState(false);
        const [itemToEditId, setItemToEditId] = useState(null);


        // Persistence handler
        const saveItemsToLocal = useCallback((updatedItems) => {
            const sortAndSet = updatedItems.sort((a, b) => (b.timestamp.getTime()) - (a.timestamp.getTime()));
            setItems(sortAndSet);
            const serializableItems = sortAndSet.map(item => ({
                ...item,
                timestamp: item.timestamp.toISOString()
            }));
            LocalDataStore.save(storageKey, serializableItems);
        }, [storageKey]);

        // Load data on initial render
        useEffect(() => {
            const loadedItems = LocalDataStore.load(storageKey);
            const formattedItems = loadedItems.map(item => ({
                ...item,
                // Convert ISO string back to Date object
                timestamp: item.timestamp ? new Date(item.timestamp) : new Date(0)
            })).sort((a, b) => (b.timestamp.getTime()) - (a.timestamp.getTime()));

            setItems(formattedItems);
            setIsLoading(false);
        }, [storageKey]);
        
        // Handle template injection from Coping Cards and Dashboard Templates
        useEffect(() => {
            if (journalTemplate && setJournalTemplate && isJournal) {
                setNewItem(journalTemplate);
                setJournalTemplate(''); 
            }
        }, [journalTemplate, setJournalTemplate, isJournal]);

        // Template Application Handler (Only for Journal)
        const handleApplyTemplate = () => {
            const templateObj = journalTemplates.find(t => t.id === selectedTemplateId);
            if (templateObj && templateObj.template) {
                setNewItem(templateObj.template);
            }
            setSelectedTemplateId('');
        };
        
        // --- JOURNALING LOGIC ---

        const handleStartEditJournal = (item) => {
            setItemToEditId(item.id);
            setNewItem(item.text);
            setIsEditingExisting(true);
        };

        const handleCancelEditJournal = () => {
            setItemToEditId(null);
            setNewItem('');
            setIsEditingExisting(false);
        };

        const handleSaveNewEntry = (e) => {
            e.preventDefault();
            if (newItem.trim() === '') return;
            
            if (isEditingExisting && itemToEditId) {
                // --- UPDATE EXISTING ENTRY (Journal/Goals) ---
                const updatedItems = items.map(item => 
                    item.id === itemToEditId ? { ...item, text: newItem, timestamp: new Date() } : item
                );
                saveItemsToLocal(updatedItems);
                handleCancelEditJournal();
            } else {
                // --- ADD NEW ENTRY ---
                const newItemObject = { 
                    id: LocalDataStore.generateId(), 
                    text: newItem, 
                    timestamp: new Date()
                };
                if (config.hasCompleted) newItemObject.completed = false;
                
                saveItemsToLocal([newItemObject, ...items]);
                setNewItem('');
            }
        };
        
        // --- GOALS LOGIC (Stays inline editing for simplicity) ---

        const handleToggleCompleted = (item) => {
            if (!config.hasCompleted) return;
            const updatedItems = items.map(i => 
                i.id === item.id ? { ...i, completed: !i.completed } : i
            );
            saveItemsToLocal(updatedItems);
        };

        const handleDeleteItem = (id) => {
            const updatedItems = items.filter(item => item.id !== id);
            saveItemsToLocal(updatedItems);
        };
        
        const handleEditGoals = (item) => {
            setEditingItem(item);
            setEditedText(item.text);
        };

        const handleUpdateGoals = (e) => {
            e.preventDefault();
            if (!editingItem || editedText.trim() === '') return;

            const updatedItems = items.map(item => 
                item.id === editingItem.id ? { ...item, text: editedText, timestamp: new Date() } : item
            );
            
            saveItemsToLocal(updatedItems);
            setEditingItem(null);
            setEditedText('');
        };
        
        // --- RENDER FUNCTIONS ---

        const JournalForm = () => (
            React.createElement("form", { onSubmit: handleSaveNewEntry, className: "mb-2 space-y-2" },
                isEditingExisting && (
                    React.createElement("div", { className: "flex justify-between items-center bg-teal-50 p-3 rounded-lg mb-4" },
                        React.createElement("p", { className: "text-sm font-semibold text-teal-700" }, "Editing Entry from: ", items.find(i => i.id === itemToEditId)?.timestamp.toLocaleString()),
                        React.createElement("button", { type: "button", onClick: handleCancelEditJournal, className: "text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded" }, "Cancel")
                    )
                ),
                
                /* Template Selector (Only for Journal) */
                !isEditingExisting && isJournal && (
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("select", { 
                            value: selectedTemplateId, 
                            onChange: (e) => setSelectedTemplateId(e.target.value), 
                            className: "flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                        },
                            journalTemplates.map(template => (
                                React.createElement("option", { key: template.id, value: template.id, disabled: !template.id ? true : false }, template.name)
                            ))
                        ),
                        React.createElement("button", { 
                            type: "button", 
                            onClick: handleApplyTemplate, 
                            disabled: !selectedTemplateId, 
                            className: "bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700 disabled:bg-gray-400 flex items-center gap-1 transition-colors"
                        }, React.createElement(CheckIcon, null), " Apply")
                    )
                ),


                /* Input/Textarea field - USING DEBOUNCED COMPONENT */
                React.createElement(DebouncedTextarea, {
                    value: newItem,
                    onChange: setNewItem,
                    placeholder: config.placeholder,
                    rows: isJournal ? "10" : "1", 
                    isInput: !isJournal
                }),

                /* Submit button(s) */
                React.createElement("div", { className: `flex justify-end gap-2` },
                    
                    React.createElement("button", { type: "submit", className: "w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700" }, isEditingExisting ? 'Save Changes' : 'Add New Entry')
                )
            )
        );
        
        const GoalsForm = () => (
            React.createElement("form", { onSubmit: handleSaveNewEntry, className: "flex gap-2 mb-6" },
                 React.createElement(DebouncedTextarea, {
                    value: newItem,
                    onChange: setNewItem,
                    placeholder: config.placeholder,
                    isInput: false, // Allow textarea for multi-line goals
                    rows: "2"
                }),
                React.createElement("button", { type: "submit", className: "flex-shrink-0 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700 transition-colors" }, "Add")
            )
        );


        return ( 
            React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg animate-fade-in h-full flex flex-col" }, 
                React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-4" }, config.title), 
                React.createElement("p", { className: "text-gray-600 mb-6" }, config.prompt), 
                
                isJournal ? React.createElement(JournalForm, null) : React.createElement(GoalsForm, null),

                config.useGemini && isJournal && (
                    React.createElement(React.Fragment, null, 
                        React.createElement("button", { onClick: () => setShowGeminiHelper(!showGeminiHelper), className: "flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-semibold mb-4" },
                            React.createElement(SparklesIcon, null),
                            " ",
                            showGeminiHelper ? 'Close AI Helper' : 'Get Idea with AI'
                        ), 
                        showGeminiHelper && React.createElement(GeminiJournalHelper, { onInsertText: (text) => setNewItem(text), onClose: () => setShowGeminiHelper(false) })
                    )
                ), 
                
                React.createElement("div", { className: "flex-grow overflow-y-auto pr-2 -mr-2 mt-4" }, 
                    isLoading ? React.createElement(Spinner, null) : (items.length > 0 ? ( 
                        React.createElement("ul", { className: "space-y-3" }, 
                            items.map(item => ( 
                                React.createElement("li", { key: item.id, className: "p-4 bg-gray-50 rounded-lg shadow-sm" },
                                    config.collectionName === 'goals' && editingItem?.id === item.id ? (
                                        React.createElement("form", { onSubmit: handleUpdateGoals, className: "space-y-2" },
                                            React.createElement("textarea", {
                                                value: editedText,
                                                onChange: (e) => setEditedText(e.target.value),
                                                className: "w-full p-2 border border-teal-500 rounded-lg resize-none",
                                                rows: 2
                                            }),
                                            React.createElement("div", { className: "flex justify-end gap-2" },
                                                React.createElement("button", { type: "button", onClick: () => setEditingItem(null), className: "text-gray-500 hover:text-gray-700 text-sm font-semibold" }, "Cancel"),
                                                React.createElement("button", { type: "submit", className: "bg-teal-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-teal-600 font-semibold" }, "Save Changes")
                                            )
                                        )
                                    ) : (
                                        React.createElement("div", { className: "flex flex-col" },
                                            React.createElement("div", { className: "flex items-start justify-between w-full" },
                                                config.hasCompleted && React.createElement("input", { type: "checkbox", checked: item.completed, onChange: () => handleToggleCompleted(item), className: "h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-4 flex-shrink-0 mt-1"}),
                                                React.createElement("div", { className: "flex-grow" },
                                                    React.createElement("p", { className: `text-gray-800 whitespace-pre-wrap ${item.completed ? 'line-through text-gray-400' : ''}` }, item.text),
                                                    React.createElement("p", { className: "text-xs text-gray-400 mt-1" }, item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Just now')
                                                )
                                            ),
                                            React.createElement("div", { className: "flex justify-end mt-2 space-x-2" },
                                                isJournal ? (
                                                    React.createElement("button", { onClick: () => handleStartEditJournal(item), className: "text-gray-500 hover:text-blue-600 text-xs font-semibold flex items-center gap-1" },
                                                        React.createElement(EditIcon, null), " Edit"
                                                    )
                                                ) : (
                                                    React.createElement("button", { onClick: () => handleEditGoals(item), className: "text-gray-500 hover:text-blue-600 text-xs font-semibold flex items-center gap-1" },
                                                        React.createElement(EditIcon, null), " Edit"
                                                    )
                                                ),
                                                React.createElement("button", { onClick: () => handleDeleteItem(item.id), className: "text-gray-500 hover:text-red-500 text-xs font-semibold flex items-center gap-1" },
                                                    React.createElement(TrashIcon, null), " Delete"
                                                )
                                            )
                                        )
                                    )
                                )
                            )) 
                        ) : ( React.createElement("div", { className: "text-center py-10" }, React.createElement("p", { className: "text-gray-500" }, config.emptyState)))
                    )
                ) 
            )
        );
    };
};
const DailyJournal = createListModule({ collectionName: 'journal', title: 'Daily Journal', prompt: 'How are you feeling? You can write about your day, feelings, or things you are grateful for.', placeholder: 'Write your entry...', emptyState: 'No journal entries yet.', useGemini: true });
const Goals = createListModule({ collectionName: 'goals', title: 'My Goals', prompt: 'Set small, achievable goals for your recovery.', placeholder: 'e.g., Attend a meeting or Call my sponsor tonight', emptyState: 'No goals set yet.', hasCompleted: true });

// --- COMPONENT: Resources (JSX converted to React.createElement for module compatibility) ---
const Resources = () => ( React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg animate-fade-in" }, React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-2" }, "S.O.S. Resources"), React.createElement("p", { className: "text-gray-600 mb-6" }, "You are not alone. Help is available."), React.createElement("ul", { className: "space-y-4" }, [ { name: "SAMHSA National Helpline", number: "1-800-662-4357", description: "Confidential free help to find substance use treatment and information." }, { name: "National Suicide Prevention Lifeline", number: "988", description: "24/7, free and confidential support for people in distress." }, { name: "Alcoholics Anonymous (A.A.)", link: "https://www.aa.org", description: "Find local and online meetings and resources." }, { name: "Narcotics Anonymous (N.A.)", link: "https://www.na.org", description: "Find local and online meetings and resources." } ].map(item => ( React.createElement("li", { key: item.name, className: "p-4 bg-gray-50 rounded-lg shadow-sm" }, React.createElement("h3", { className: "font-bold text-teal-700" }, item.name), React.createElement("p", { className: "text-gray-600 my-1" }, item.description), item.number && React.createElement("a", { href: `tel:${item.number}`, className: "text-blue-600 font-semibold hover:underline" }, item.number), item.link && React.createElement("a", { href: item.link, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 font-semibold hover:underline" }, "Visit Website"))))) ));

// --- COMPONENT: Meeting Finder (JSX converted to React.createElement for module compatibility) ---
const MeetingFinder = () => {
    const [selectedFellowship, setSelectedFellowship] = useState('AA');

    const selectedData = MEETING_LINKS[selectedFellowship];

    return (
        React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg animate-fade-in h-full flex flex-col" },
            React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-4" }, "Meeting Finder"),
            React.createElement("p", { className: "text-gray-600 mb-6" }, "Access official external resources to ", React.createElement("strong", null, "find local meetings"), " in your area."),
            
            React.createElement("div", { className: "space-y-4 mb-8" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700" }, "Select Fellowship:"),
                React.createElement("select", { 
                    value: selectedFellowship,
                    onChange: (e) => setSelectedFellowship(e.target.value),
                    className: "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                },
                    Object.keys(MEETING_LINKS).map(key => (
                        React.createElement("option", { key: key, value: key }, MEETING_LINKS[key].name)
                    ))
                )
            ),

            selectedData && (
                React.createElement("div", { className: "bg-teal-50 p-6 rounded-lg border-l-4 border-teal-500 space-y-4" },
                    React.createElement("h3", { className: "text-xl font-bold text-teal-800" }, selectedData.name, " Search"),
                    React.createElement("p", { className: "text-gray-700" }, selectedData.instructions),
                    React.createElement("a", { 
                        href: selectedData.link, 
                        target: "_blank", 
                        rel: "noopener noreferrer",
                        className: "inline-flex items-center justify-center w-full py-3 px-4 text-white font-semibold bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition-colors"
                    }, "Go to Official Finder")
                )
            ),
            
            React.createElement("div", { className: "mt-8 text-sm text-gray-500 border-t pt-4" },
                React.createElement("p", null, "Tip: When the external site opens, use their geolocation features or search fields to find meetings near you.")
            )
        )
    );
};

// --- COMPONENT: Coping Cards (JSX converted to React.createElement for module compatibility) ---
const CopingCards = ({ onJournal }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const card = allCopingCards[currentIndex];
    const maxIndex = allCopingCards.length - 1;

    const showNextCard = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % allCopingCards.length);
    };

    const showPreviousCard = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + allCopingCards.length) % allCopingCards.length);
    };

    const CardIconComponent = card.icon;

    return ( 
        React.createElement("div", { className: "flex flex-col items-center justify-center h-full p-4 animate-fade-in" }, 
            React.createElement("div", { 
                className: `p-8 rounded-xl shadow-xl w-full max-w-md text-center flex-grow flex flex-col justify-between 
                           bg-gradient-to-br ${card.color} text-gray-900 border border-gray-100`
            },
                React.createElement("div", { className: "flex justify-between items-start mb-4" },
                    React.createElement("button", { onClick: showPreviousCard, className: "text-gray-700 hover:text-black p-1 rounded-full bg-white/70 shadow-md" },
                        React.createElement(ArrowLeftIcon, null)
                    ),
                    React.createElement("div", { className: "flex flex-col items-center" },
                        React.createElement(CardIconComponent, { className: "w-8 h-8 text-teal-800 mb-2" }),
                        React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-teal-800" }, card.category)
                    ),
                    React.createElement("button", { onClick: showNextCard, className: "text-gray-700 hover:text-black p-1 rounded-full bg-white/70 shadow-md" },
                        React.createElement(ArrowLeftIcon, { style: { transform: 'rotate(180deg)' } })
                    )
                ),
                
                React.createElement("div", { className: "flex flex-col justify-center flex-grow" },
                    React.createElement("h2", { className: "text-3xl font-bold text-teal-900 mb-4" }, card.title),
                    React.createElement("p", { className: "text-gray-800 text-lg" }, card.description)
                ),

                React.createElement("p", { className: "text-xs text-gray-600 mt-4" }, "Card ", currentIndex + 1, " of ", allCopingCards.length)
            ), 
            
            React.createElement("div", { className: "flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md" }, 
                React.createElement("button", { onClick: () => onJournal(card), className: "w-full bg-white text-teal-600 border-2 border-teal-600 font-bold py-3 px-8 rounded-lg shadow-md hover:bg-teal-50 transition-colors" }, "Journal on This")
            ) 
        ) 
    );
};

// --- WORKBOOK (Placeholder for brevity, full logic uses the workbookData structure from data.js) ---
const workbookData = {
    generalRecovery: { title: "General Recovery Exercises", description: "Core exercises for your recovery.", topics: [{ id: 'understanding-addiction', title: 'Understanding My Addiction', prompt: 'Reflect...' }] },
    twelveSteps: { 
        title: "12-Step Workbook", 
        description: "A guide to working the 12 Steps...", 
        topics: [ { id: 'step-1', title: 'Step 1: Honesty', quote: 'We admitted we were powerless...', sections: [{ title: "A. The Problem of Powerlessness", questions: ["1. In your own words..."] }] } ] 
    }
};


const WorkbookQuestion = ({ questionText, questionKey }) => {
    const [response, setResponse] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const isInitialLoad = useRef(true);

    useEffect(() => {
        const data = LocalDataStore.load(LocalDataStore.KEYS.WORKBOOK) || {};
        setResponse(data[questionKey] || '');
        setSaveStatus('Initial Load');
    }, [questionKey]);

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        setSaveStatus('Saving...');
        
        const delayDebounceFn = setTimeout(() => {
            try {
                const data = LocalDataStore.load(LocalDataStore.KEYS.WORKBOOK) || {};
                const updatedData = { ...data, [questionKey]: response };
                LocalDataStore.save(LocalDataStore.KEYS.WORKBOOK, updatedData);
                setSaveStatus('Saved');
            } catch (error) {
                console.error("Error saving workbook response:", error);
                setSaveStatus('Error');
            }
        }, 1500);

        return () => clearTimeout(delayDebounceFn);
    }, [response, questionKey]);

    return (
        React.createElement("div", { className: "mb-4 pb-2" },
            React.createElement("p", { className: "workbook-question text-gray-800" }, questionText),
            React.createElement("textarea", { 
                value: response, 
                onChange: (e) => setResponse(e.target.value), 
                placeholder: "Write your answer here...", 
                className: "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 resize-y min-h-[100px] text-sm",
                rows: "4"
            }),
            React.createElement("p", { className: "text-right text-xs text-gray-500 mt-1 h-4" }, saveStatus === 'Saved' ? 'Saved' : (saveStatus === 'Saving...' ? 'Saving...' : '\u00A0'))
        )
    );
};

const CollapsibleWorkbookSection = ({ section, stepId }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const contentRef = useRef(null);
    
    const keyPrefix = `${stepId}-${section.title.charAt(0)}`; 
    
    useEffect(() => {
        if (!isCollapsed && contentRef.current) {
            contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
        }
    }, [isCollapsed]);

    return (
        React.createElement("div", { className: "mb-4 border border-gray-200 rounded-lg shadow-sm overflow-hidden" },
            React.createElement("button", { 
                onClick: () => setIsCollapsed(!isCollapsed),
                className: `w-full flex justify-between items-center p-4 font-bold text-lg transition-colors ${isCollapsed ? 'bg-gray-50 hover:bg-gray-100 text-gray-700' : 'bg-teal-500 text-white hover:bg-teal-600'}`
            },
                section.title,
                isCollapsed ? React.createElement(ChevronDown, null) : React.createElement(ChevronUp, null)
            ),
            
            React.createElement("div", { 
                ref: contentRef,
                style: {
                    maxHeight: isCollapsed ? '0' : '9999px',
                    transition: 'max-height 0.4s ease-in-out',
                },
                className: "overflow-hidden p-4 bg-white"
            },
                section.questions.map((question, qIndex) => {
                    const questionKey = `${keyPrefix}-${qIndex + 1}`;
                    return (
                        React.createElement(WorkbookQuestion, {
                            key: questionKey,
                            questionText: question,
                            questionKey: questionKey
                        })
                    );
                })
            )
        )
    );
};

const WorkbookTopic = ({ topic, onBack }) => {
    const [isLoading, setIsLoading] = useState(false); 
    
    if (isLoading) { return React.createElement("div", { className: "h-full flex items-center justify-center" }, React.createElement(Spinner, null)); }

    return (
        React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg animate-fade-in h-full flex flex-col" },
            React.createElement("button", { onClick: onBack, className: "flex items-center text-teal-600 hover:text-teal-800 mb-4 font-semibold flex-shrink-0" }, React.createElement(ArrowLeftIcon, null), React.createElement("span", { className: "ml-2" }, "Back to Topics")),
            
            React.createElement("h3", { className: "2xl font-bold text-gray-800 mb-2" }, topic.title),
            
            topic.quote && (
                React.createElement("div", { className: "step-quote" }, topic.quote)
            ),

            React.createElement("div", { className: "overflow-y-auto flex-grow pr-2" },
                topic.sections ? (
                    topic.sections.map((section, secIndex) => (
                        React.createElement(CollapsibleWorkbookSection, { 
                            key: secIndex, 
                            section: section, 
                            stepId: topic.id 
                        })
                    ))
                ) : (
                    React.createElement("p", { className: "text-gray-600 mb-6" }, topic.prompt)
                )
            )
        )
    );
};

const WorkbookCategory = ({ category, onSelectTopic, onBack, completedTopicIds }) => (
    React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg animate-fade-in" },
        React.createElement("button", { onClick: onBack, className: "flex items-center text-teal-600 hover:text-teal-800 mb-4 font-semibold" }, React.createElement(ArrowLeftIcon, null), React.createElement("span", { className: "ml-2" }, "Back to Workbook Sections")),
        React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-2" }, category.title),
        React.createElement("p", { className: "text-gray-600 mb-6" }, category.description),
        React.createElement("ul", { className: "space-y-3" },
            category.topics.map(topic => (
                React.createElement("li", { key: topic.id },
                    React.createElement("button", { onClick: () => onSelectTopic(topic), className: "w-full text-left p-4 bg-gray-50 hover:bg-teal-50 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-between" },
                        React.createElement("h3", { className: "font-semibold text-gray-800" }, topic.title),
                        completedTopicIds.includes(topic.id) && React.createElement(CheckCircleIcon, { className: "text-green-500" })
                    )
                )
            ))
        )
    )
);

const RecoveryWorkbook = () => {
    const [activeCategory, setActiveCategory] = useState(null); 
    const [selectedTopic, setSelectedTopic] = useState(null); 
    const [workbookResponses, setWorkbookResponses] = useState({});

    useEffect(() => {
        const loadedData = LocalDataStore.load(LocalDataStore.KEYS.WORKBOOK) || {};
        setWorkbookResponses(loadedData);
        
        const handleStorageChange = (e) => {
            if (e.key === LocalDataStore.KEYS.WORKBOOK) {
                setWorkbookResponses(LocalDataStore.load(LocalDataStore.KEYS.WORKBOOK) || {});
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const completedTopicIds = useMemo(() => {
        const completed = new Set();
        
        Object.values(workbookData).forEach(category => {
            if (category && category.topics) {
                category.topics.forEach(topic => {
                    let topicHasContent = false;
                    
                    if (topic.sections) {
                        // 12-Step Topics
                        topic.sections.forEach(section => {
                            section.questions.forEach((_, index) => {
                                const key = `${topic.id}-${section.title.charAt(0)}-${index + 1}`;
                                if (workbookResponses[key] && workbookResponses[key].trim().length > 0) {
                                    topicHasContent = true;
                                }
                            });
                        });
                    } else if (workbookResponses[topic.id] && workbookResponses[topic.id].trim().length > 0) {
                        // General Topics
                        topicHasContent = true;
                    }

                    if (topicHasContent) {
                        completed.add(topic.id);
                    }
                });
            }
        });

        return Array.from(completed);

    }, [workbookResponses]);

    const calculateCompletion = useCallback((key) => {
        const topics = workbookData[key]?.topics || [];
        const completed = topics.filter(t => completedTopicIds.includes(t.id)).length;
        const total = topics.length;
        return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [completedTopicIds]);

    const overallCompletion = useMemo(() => {
        const allTopics = Object.values(workbookData).flatMap(c => c.topics);
        const completed = allTopics.filter(t => completedTopicIds.includes(t.id)).length;
        const total = allTopics.length;
        return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [completedTopicIds]);
    
    if (selectedTopic && selectedTopic.sections) return React.createElement(WorkbookTopic, { topic: selectedTopic, onBack: () => setSelectedTopic(null) });
    if (selectedTopic) return React.createElement(WorkbookTopic, { topic: selectedTopic, onBack: () => setSelectedTopic(null) });
    if (activeCategory) return React.createElement(WorkbookCategory, { category: activeCategory, onSelectTopic: setSelectedTopic, onBack: () => setActiveCategory(null), completedTopicIds: completedTopicIds });
    
    return ( React.createElement("div", { className: "bg-white p-6 rounded-xl shadow-lg animate-fade-in" }, React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-2" }, "Recovery Workbook"), React.createElement("p", { className: "text-gray-600 mb-6" }, "Track your progress."), React.createElement("div", { className: "mb-6" }, React.createElement("div", { className: "flex justify-between items-center mb-1" }, React.createElement("span", { className: "text-sm font-semibold text-gray-600" }, "Overall Progress"), React.createElement("span", { className: "text-sm font-semibold text-teal-600" }, overallCompletion.percentage, "%")), React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2.5" }, React.createElement("div", { className: "bg-teal-500 h-2.5 rounded-full", style: { width: `${overallCompletion.percentage}%` } }))), React.createElement("ul", { className: "space-y-4" }, Object.keys(workbookData).map(key => { const category = workbookData[key]; if (!category) return null; const { completed, total, percentage } = calculateCompletion(key); return ( React.createElement("li", { key: key }, React.createElement("button", { onClick: () => setActiveCategory(category), className: "w-full text-left p-4 bg-gray-50 hover:bg-teal-50 rounded-lg shadow-sm" }, React.createElement("h3", { className: "font-semibold text-gray-800 text-lg" }, category.title), React.createElement("p", { className: "text-gray-600 mt-1 text-sm" }, category.description), React.createElement("div", { className: "mt-3" }, React.createElement("div", { className: "flex justify-between items-center mb-1" }, React.createElement("span", { className: "text-xs font-semibold text-gray-500" }, completed, " / ", total, " Completed"), React.createElement("span", { className: "text-xs font-semibold text-teal-600" }, percentage, "%")), React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-1.5" }, React.createElement("div", { className: "bg-teal-500 h-1.5 rounded-full", style: { width: `${percentage}%` } })))))); }))) );
};


// --- COMPONENT: Page Footer (JSX converted to React.createElement for module compatibility) ---
const PageFooter = ({ activeView }) => {
    const getVersion = () => {
        const key = activeView.toUpperCase();
        let componentName = activeView.charAt(0).toUpperCase() + activeView.slice(1);
        let version = APP_VERSIONS[key] || APP_VERSIONS.DASHBOARD;
        
        if (key === 'DASHBOARD') componentName = "App Core";
        if (key === 'WORKBOOK') componentName = "Workbook";
        if (key === 'LITERATURE') componentName = "Literature";
        if (key === 'SETTINGS') componentName = "Settings";

        return { componentName, version };
    };
    
    const { componentName, version } = getVersion();

    return (
        React.createElement("footer", { className: "w-full max-w-2xl mx-auto flex-shrink-0 text-center py-2 text-xs text-gray-400 border-t border-gray-200 mt-2" },
            "Version: ",
            componentName,
            " v",
            version
        )
    );
};


// --- COMPONENT: App (Main Component) ---
const App = () => {
    const { isAuthLoading } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [sobrietyStartDate, setSobrietyStartDate] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [journalTemplate, setJournalTemplate] = useState('');

    useEffect(() => {
        const storedDate = LocalDataStore.load(LocalDataStore.KEYS.SOBRIETY);
        if (storedDate) {
            setSobrietyStartDate(new Date(storedDate));
        }
        setIsDataLoading(false);
    }, []);

    const handleJournalFromCopingCard = (card) => {
        const template = `Coping Card Reflection: "${card.title}"\n\n**Strategy:** ${card.description}\n\n**My Application Plan:** (How will I use this skill the next time I have a craving?)\n\n`;
        setJournalTemplate(template);
        setActiveView('journal');
    };
    
    const handleSobrietyDateUpdate = (newDate, journal) => {
        const newDateString = newDate.toISOString();
        LocalDataStore.save(LocalDataStore.KEYS.SOBRIETY, newDateString);
        setSobrietyStartDate(newDate);

        if (journal) {
            const template = `Sobriety Date Change Reflection (${new Date().toLocaleDateString()}):\n\n**Previous Date:** ${sobrietyStartDate.toLocaleDateString()}\n**New Date:** ${newDate.toLocaleDateString()}\n\nI am changing my date because:\n\nThis decision is important because:`;
            setJournalTemplate(template);
            setActiveView('journal');
        } else {
            setActiveView('dashboard');
        }
    };

    const renderContent = () => {
        if (isAuthLoading || isDataLoading) return React.createElement("div", { className: "h-full flex items-center justify-center" }, React.createElement(Spinner, null));
        
        if (!sobrietyStartDate) return React.createElement(SobrietyDataSetup, { onDateSet: setSobrietyStartDate });
        
        if (sobrietyStartDate) {
            switch (activeView) {
                case 'dashboard': return React.createElement(Dashboard, { onNavigate: setActiveView, sobrietyStartDate: sobrietyStartDate });
                case 'journal': return React.createElement(DailyJournal, { journalTemplate: journalTemplate, setJournalTemplate: setJournalTemplate });
                case 'goals': return React.createElement(Goals, null);
                case 'coping': return React.createElement(CopingCards, { onJournal: handleJournalFromCopingCard });
                case 'workbook': return React.createElement(RecoveryWorkbook, null);
                case 'literature': return React.createElement(RecoveryLiterature, null);
                case 'resources': return React.createElement(Resources, null);
                case 'settings': return React.createElement(Settings, { 
                    currentStartDate: sobrietyStartDate, 
                    handleSobrietyDateUpdate: handleSobrietyDateUpdate,
                    onBack: () => setActiveView('dashboard')
                });
                case 'finder': return React.createElement(MeetingFinder, null);
                default: return React.createElement(Dashboard, { onNavigate: setActiveView, sobrietyStartDate: sobrietyStartDate });
            }
        }
    };
    
    const headerTitle = useMemo(() => {
        const titles = { dashboard: "The Addict's Agenda", coping: "Coping Cards", literature: "Recovery Literature", journal: "Daily Journal", goals: "My Goals", workbook: "Recovery Workbook", resources: "S.O.S. Resources", settings: "Settings", finder: "Meeting Finder" };
        return titles[activeView] || "Recovery";
    }, [activeView]);

    return (
        React.createElement("div", { className: "bg-gray-100 h-screen w-full flex flex-col font-sans text-gray-800 p-2 sm:p-4" },
            React.createElement("div", { className: "flex-shrink-0 w-full max-w-2xl mx-auto" },
                React.createElement("header", { className: "flex items-center justify-between p-4" },
                    /* 1. Left Side: Back Button or Spacer */
                    activeView !== 'dashboard' && activeView !== 'settings' && sobrietyStartDate ? (
                        React.createElement("button", { onClick: () => setActiveView('dashboard'), className: "text-teal-600 hover:text-teal-800 p-2 -ml-2" }, React.createElement(ArrowLeftIcon, null))
                    ) : React.createElement("div", { className: "w-10" }),
                    
                    React.createElement("h1", { className: "text-xl font-bold text-gray-700" }, headerTitle),
                    
                    /* 2. Right Side: Settings Cog or Spacer */
                    activeView === 'dashboard' && sobrietyStartDate ? (
                        React.createElement("button", { onClick: () => setActiveView('settings'), className: "text-gray-500 hover:text-teal-600 p-1" },
                            React.createElement(SettingsIcon, null)
                        )
                    ) : React.createElement("div", { className: "w-10" })
                    
                )
            ),
            React.createElement("main", { className: "flex-grow w-full max-w-2xl mx-auto overflow-y-auto pb-4" },
                renderContent()
            ),
            sobrietyStartDate && React.createElement(PageFooter, { activeView: activeView })
        )
    );
};

// Initialize and render the App component
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App, null));
