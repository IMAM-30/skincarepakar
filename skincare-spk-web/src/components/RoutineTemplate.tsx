import type { RoutineTemplate as RoutineTemplateType } from "@/lib/types";

type RoutineTemplateProps = {
  routine: RoutineTemplateType;
};

export function RoutineTemplate({ routine }: RoutineTemplateProps) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Routine sederhana</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium text-sage">Pagi</h3>
          <ol className="mt-2 space-y-2 text-sm text-muted">
            {routine.morning.map((step, index) => (
              <li key={step}>{index + 1}. {step}</li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="font-medium text-sage">Malam</h3>
          <ol className="mt-2 space-y-2 text-sm text-muted">
            {routine.night.map((step, index) => (
              <li key={step}>{index + 1}. {step}</li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium text-ink">Cari kandungan</h3>
          <p className="mt-2 text-sm text-muted">{routine.look_for.join(", ")}</p>
        </div>
        <div>
          <h3 className="font-medium text-ink">Perhatikan</h3>
          <p className="mt-2 text-sm text-muted">{routine.caution.join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
