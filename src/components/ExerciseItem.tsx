import { useState } from 'react';
import type { WorkoutExercise, WorkoutSet, Exercise } from '@/types';
import { Trash2, Plus, Check } from 'lucide-react';

interface ExerciseItemProps {
  exercise: Exercise;
  workoutExercise: WorkoutExercise;
  onUpdate: (workoutExercise: WorkoutExercise) => void;
  onRemove: (exerciseId: string) => void;
}

export default function ExerciseItem({
  exercise,
  workoutExercise,
  onUpdate,
  onRemove,
}: ExerciseItemProps) {
  const [expanded, setExpanded] = useState(false);

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    const updatedSets = workoutExercise.sets.map((s) =>
      s.id === setId ? { ...s, ...updates } : s
    );
    onUpdate({ ...workoutExercise, sets: updatedSets });
  };

  const addSet = () => {
    const lastSet = workoutExercise.sets[workoutExercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: `set-${Date.now()}`,
      exercise_id: exercise.id,
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      rest_time: lastSet?.rest_time || 60,
      completed: false,
    };
    onUpdate({ ...workoutExercise, sets: [...workoutExercise.sets, newSet] });
  };

  const removeSet = (setId: string) => {
    const updatedSets = workoutExercise.sets.filter((s) => s.id !== setId);
    onUpdate({ ...workoutExercise, sets: updatedSets });
  };

  const toggleSetComplete = (setId: string) => {
    const updatedSets = workoutExercise.sets.map((s) =>
      s.id === setId ? { ...s, completed: !s.completed } : s
    );
    onUpdate({ ...workoutExercise, sets: updatedSets });
  };

  return (
    <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[#001317] transition"
      >
        <div className="text-left flex-1">
          <h3 className="text-white font-bold">{exercise.name}</h3>
          <p className="text-[#00fff3] text-sm">{exercise.muscle_group}</p>
        </div>
        <div className="text-gray-400">
          {expanded ? '▼' : '▶'}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-[#00fff3]/20 p-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-gray-400 text-sm">{exercise.description}</p>
          </div>

          {/* Instructions */}
          {exercise.instructions.length > 0 && (
            <div>
              <h4 className="text-[#00fff3] font-semibold mb-2">Instruções:</h4>
              <ol className="space-y-1 text-gray-300 text-sm">
                {exercise.instructions.map((instr, i) => (
                  <li key={i}>{i + 1}. {instr}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Tips */}
          {exercise.tips.length > 0 && (
            <div>
              <h4 className="text-[#00fff3] font-semibold mb-2">Dicas:</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                {exercise.tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sets */}
          <div>
            <h4 className="text-[#00fff3] font-semibold mb-3">Séries:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {workoutExercise.sets.map((set, index) => (
                <div
                  key={set.id}
                  className="flex items-center gap-2 p-3 bg-[#001317] rounded-lg border border-[#00fff3]/20"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSetComplete(set.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                      set.completed
                        ? 'bg-[#00fff3] border-[#00fff3]'
                        : 'border-[#00fff3]/30 hover:border-[#00fff3]'
                    }`}
                  >
                    {set.completed && <Check size={16} className="text-[#001317]" />}
                  </button>

                  {/* Series number */}
                  <span className="text-gray-400 font-semibold min-w-12">
                    Série {index + 1}
                  </span>

                  {/* Reps */}
                  <div className="flex items-center gap-1">
                    <label className="text-gray-400 text-sm">Reps:</label>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(set.id, { reps: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 bg-[#0a2b31] border border-[#00fff3]/20 text-[#00fff3] rounded text-sm"
                    />
                  </div>

                  {/* Weight */}
                  <div className="flex items-center gap-1">
                    <label className="text-gray-400 text-sm">Kg:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => updateSet(set.id, { weight: parseFloat(e.target.value) })}
                      className="w-16 px-2 py-1 bg-[#0a2b31] border border-[#00fff3]/20 text-[#00fff3] rounded text-sm"
                    />
                  </div>

                  {/* Rest time */}
                  <div className="flex items-center gap-1">
                    <label className="text-gray-400 text-sm">Descanso:</label>
                    <input
                      type="number"
                      value={set.rest_time}
                      onChange={(e) => updateSet(set.id, { rest_time: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 bg-[#0a2b31] border border-[#00fff3]/20 text-[#00fff3] rounded text-sm"
                    />
                    <span className="text-gray-400 text-sm">s</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeSet(set.id)}
                    className="flex-shrink-0 p-1 text-red-500 hover:bg-red-500/20 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add set button */}
            <button
              onClick={addSet}
              className="w-full mt-3 py-2 border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Adicionar Série
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">Notas:</label>
            <textarea
              value={workoutExercise.notes || ''}
              onChange={(e) => onUpdate({ ...workoutExercise, notes: e.target.value })}
              placeholder="Adicione suas notas..."
              className="w-full px-3 py-2 bg-[#001317] border border-[#00fff3]/20 text-white rounded resize-none focus:border-[#00fff3] outline-none"
              rows={2}
            />
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(exercise.id)}
            className="w-full py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Remover Exercício
          </button>
        </div>
      )}
    </div>
  );
}
