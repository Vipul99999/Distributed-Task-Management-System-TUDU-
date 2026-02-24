"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useImprove } from "@/hooks/useImprove";
import type { Improvement, Category } from "@/types/improve";
import { createImprovementSchema } from "@/validation/improveValidator";

type ImprovementFormData = z.infer<typeof createImprovementSchema>;

const predefinedCategories: Category[] = [
  { id: "health", name: "Health (fitness, nutrition, sleep)" },
  { id: "work", name: "Work / Career (productivity, skills, leadership)" },
  { id: "mindset", name: "Mindset / Mental Health (mindfulness, stress)" },
  { id: "relationships", name: "Relationships (communication, empathy)" },
  { id: "learning", name: "Learning / Education (reading, skills)" },
  { id: "creativity", name: "Creativity (hobbies, artistic pursuits)" },
  { id: "finance", name: "Finance (budgeting, saving)" },
  { id: "organization", name: "Organization (decluttering, time management)" },
  { id: "personal_growth", name: "Personal Growth (confidence, habits)" },
  { id: "recreation", name: "Recreation / Fun (leisure, social activities)" },
];

export const ImproveDashboard: React.FC = () => {
  const { improvements, createImprovement, updateImprovement } = useImprove();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<ImprovementFormData>({
    resolver: zodResolver(createImprovementSchema),
    mode: "onChange",
  });

  const todayString = new Date().toISOString().slice(0, 10);
  const todaysImprovement = improvements?.find((imp) => imp.date === todayString);

  const onSubmit = async (data: ImprovementFormData) => {
    try {
      const payload = {
        ...data,
        date: todayString,
        isCompleted: false,
        status: "active",
      };
      await createImprovement.mutateAsync(payload);
      reset();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create improvement:", error);
    }
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-gray-50 min-h-screen max-w-3xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">🌱 Improve</h2>
        <p className="text-gray-500 text-sm">Log one small improvement today and track your growth over time.</p>
      </header>

      {!todaysImprovement && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition mb-6"
        >
          Add Today’s Improvement
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">✨ Today’s Improvement</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-600 mb-1">
                Your Improvement
              </label>
              <input
                id="text"
                type="text"
                {...register("text")}
                placeholder="e.g. Stretch 5 minutes after lunch"
                maxLength={500}
                autoFocus
                className={`w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-green-400 ${
                  errors.text ? "border-red-600" : "border-gray-300"
                }`}
                aria-invalid={!!errors.text}
                aria-describedby="text-error"
              />
              {errors.text && (
                <p role="alert" id="text-error" className="mt-1 text-red-600 text-sm">
                  {errors.text.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-600 mb-1">
                Category (optional)
              </label>
              <select
                id="categoryId"
                {...register("categoryId")}
                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-green-400 border-gray-300"
                defaultValue=""
              >
                <option value="">Select a category</option>
                {predefinedCategories.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="futureNote" className="block text-sm font-medium text-gray-600 mb-1">
                Future Self Note (optional)
              </label>
              <textarea
                id="futureNote"
                {...register("futureNote")}
                placeholder="Why will this help your future self?"
                className={`w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-green-400 ${
                  errors.futureNote ? "border-red-600" : "border-gray-300"
                }`}
                maxLength={500}
                rows={3}
                aria-invalid={!!errors.futureNote}
                aria-describedby="futureNote-error"
              />
              {errors.futureNote && (
                <p role="alert" id="futureNote-error" className="mt-1 text-red-600 text-sm">
                  {errors.futureNote.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !isDirty || !isValid}
                className={`flex-1 py-2 rounded font-semibold text-white transition ${
                  isSubmitting || !isDirty || !isValid
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save Improvement"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {todaysImprovement && !showForm && (
        <div className="bg-white border rounded-xl shadow-sm p-5 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📌 Today’s Improvement</h3>
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">📅 {new Date(todaysImprovement.date).toLocaleDateString()}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">
                {predefinedCategories.find((c) => c.id === todaysImprovement.categoryId)?.name || "Uncategorized"}
              </span>
            </div>
            <p className="text-gray-800 font-medium">“{todaysImprovement.text}”</p>
            {todaysImprovement.futureNote && (
              <p className="text-sm text-gray-500 italic mt-1">{todaysImprovement.futureNote}</p>
            )}
            <button
              className="mt-4 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              onClick={() => setShowForm(true)}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📖 History</h3>
        <ul className="space-y-3">
          {improvements
            ?.filter((imp) => imp.date !== todayString)
            .map((imp) => (
              <li key={imp.id} className="border rounded-lg p-3 flex justify-between items-center">
                <span>{imp.text}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                  {predefinedCategories.find((c) => c.id === imp.categoryId)?.name || "Uncategorized"}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
};
