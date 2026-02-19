"use client";

import { useState, useEffect, useCallback } from "react";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ParsedNote {
  title: string;
  content: string;
  checklist_items: ChecklistItem[];
}

interface Note {
  id: string;
  content: string; // JSON string containing title, content, checklist_items
  user_id: string;
  ticket_id: string;
  created_at: string;
}

interface NotesPanelProps {
  ticketId?: string;
  ticketNumber?: string;
  userId?: string;
  accentColor?: string;
  showAddForm?: boolean;
  onAddFormClose?: () => void;
}

export default function NotesPanel({ ticketId, ticketNumber, userId, accentColor = "#EB4C36", showAddForm = false, onAddFormClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAddNote, setShowAddNote] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newChecklistItems, setNewChecklistItems] = useState<ChecklistItem[]>([]);

  // Sync internal state with external prop
  useEffect(() => {
    if (showAddForm) {
      setShowAddNote(true);
    }
  }, [showAddForm]);

  const totalNotes = notes.length;
  const currentNote = notes[currentPage];

  // Parse note content from JSON
  const parseNoteContent = (content: string): ParsedNote => {
    try {
      return JSON.parse(content);
    } catch {
      // Fallback for plain text notes
      return { title: "Note", content, checklist_items: [] };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    if (!ticketId || !userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes?user_id=${userId}`);
      const data = await res.json();
      setNotes(data.notes || []);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleToggleCheckItem = async (itemId: string) => {
    if (!currentNote || !userId) return;

    const parsed = parseNoteContent(currentNote.content);
    const updatedItems = parsed.checklist_items.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item));

    const updatedContent = JSON.stringify({
      ...parsed,
      checklist_items: updatedItems,
    });

    // Optimistic update - update UI immediately
    setNotes((prevNotes) => prevNotes.map((note) => (note.id === currentNote.id ? { ...note, content: updatedContent } : note)));

    // Sync to backend in background (no await, no refresh)
    fetch(`/api/tickets/${ticketId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        note_id: currentNote.id,
        content: updatedContent,
        user_id: userId,
      }),
    }).catch((error) => console.error("Error updating checklist:", error));
  };

  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: "",
      checked: false,
    };
    setNewChecklistItems([...newChecklistItems, newItem]);
  };

  const handleUpdateChecklistText = (id: string, text: string) => {
    setNewChecklistItems((items) => items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const handleRemoveChecklistItem = (id: string) => {
    setNewChecklistItems((items) => items.filter((item) => item.id !== id));
  };

  const handleSaveNote = async () => {
    if (!ticketId || !userId || !newTitle.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          checklist_items: newChecklistItems.filter((item) => item.text.trim()),
          user_id: userId,
        }),
      });

      if (res.ok) {
        setShowAddNote(false);
        setNewTitle("");
        setNewContent("");
        setNewChecklistItems([]);
        onAddFormClose?.();
        fetchNotes();
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  if (!ticketId) {
    return (
      <div className="flex-1 bg-white rounded-lg shadow-soft flex flex-col items-center justify-center p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">note_stack</span>
        <p className="text-sm text-slate-400">Select a ticket to view your notes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-soft flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">note_stack</span>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">My Notes</h3>
          {ticketNumber && <span className="text-xs text-slate-400 font-mono">#{ticketNumber}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin size-6 border-2 border-slate-200 border-t-slate-500 rounded-full" />
          </div>
        ) : showAddNote ? (
          /* Add Note Form */
          <div className="flex-1 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Note title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
            <textarea
              placeholder="Write your note..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 min-h-[80px] w-full px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />

            {/* Checklist Items */}
            {newChecklistItems.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {newChecklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-300 text-lg">check_box_outline_blank</span>
                    <input
                      type="text"
                      placeholder="Checklist item..."
                      value={item.text}
                      onChange={(e) => handleUpdateChecklistText(item.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button onClick={() => handleRemoveChecklistItem(item.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Checklist Button */}
            <button onClick={handleAddChecklistItem} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined text-lg">add_task</span>
              Add checklist item
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddNote(false);
                  setNewTitle("");
                  setNewContent("");
                  setNewChecklistItems([]);
                  onAddFormClose?.();
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleSaveNote} disabled={!newTitle.trim()} className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: accentColor }}>
                Save Note
              </button>
            </div>
          </div>
        ) : totalNotes === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-slate-200 mb-3">edit_note</span>
            <p className="text-sm text-slate-400 mb-4">No notes yet for this ticket</p>
            <button onClick={() => setShowAddNote(true)} className="px-4 py-2 text-sm font-bold rounded-xl text-white shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: accentColor }}>
              Add your first note
            </button>
          </div>
        ) : (
          /* Note Content - Direct in container */
          <>
            <div className="flex-1 flex flex-col">
              {(() => {
                const parsed = parseNoteContent(currentNote.content);
                return (
                  <>
                    {/* Note Title */}
                    <h4 className="font-bold text-slate-900 text-base mb-3">{parsed.title}</h4>

                    {/* Note Content */}
                    {parsed.content && <p className="text-sm text-slate-600 mb-4 leading-relaxed">{parsed.content}</p>}

                    {/* Checklist Items */}
                    {parsed.checklist_items.length > 0 && (
                      <div className="space-y-2 mb-4 pt-3 border-t border-slate-100">
                        {parsed.checklist_items.map((item) => (
                          <label key={item.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleToggleCheckItem(item.id)}>
                            <div className={`size-5 rounded flex items-center justify-center transition-colors ${item.checked ? "bg-green-500" : "border-2 border-slate-300 group-hover:border-slate-400"}`}>
                              {item.checked && <span className="material-symbols-outlined text-white text-sm">check</span>}
                            </div>
                            <span className={`text-sm ${item.checked ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-auto pt-3 flex items-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span className="text-xs">{formatTime(currentNote.created_at)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Pagination */}
            {totalNotes > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <span className="text-sm font-medium text-slate-500">
                  {currentPage + 1} of {totalNotes}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalNotes - 1, p + 1))}
                  disabled={currentPage === totalNotes - 1}
                  className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
