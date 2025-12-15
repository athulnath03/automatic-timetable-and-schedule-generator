
# Simple greedy scheduler used by API.
# This is intentionally readable and replaceable with more advanced algorithms.

from collections import defaultdict
import random

def generate_timetable(data):
    days = data.get('days', ["Mon","Tue","Wed","Thu","Fri"])
    periods = int(data.get('periods_per_day', 6))
    classes = data.get('classes', [])
    subjects = data.get('subjects', [])

    if not classes or not subjects:
        raise ValueError("Please provide at least one class and one subject.")

    subj_pool = []
    for s in subjects:
        count = int(s.get('periods_per_week', 1))
        for _ in range(count):
            subj_pool.append({"name": s['name'], "teacher": s.get('teacher','')})

    timetable = {c: [[None for _ in range(periods)] for _ in days] for c in classes}
    teacher_occ = defaultdict(set)

    for cls in classes:
        pool = subj_pool.copy()
        random.shuffle(pool)
        for subj in pool:
            placed = False
            positions = [(d,p) for d in range(len(days)) for p in range(periods)]
            random.shuffle(positions)
            for d,p in positions:
                if timetable[cls][d][p] is None and (d,p) not in teacher_occ.get(subj.get('teacher',''), set()):
                    timetable[cls][d][p] = {"subject": subj['name'], "teacher": subj.get('teacher','')}
                    teacher_occ.setdefault(subj.get('teacher',''), set()).add((d,p))
                    placed = True
                    break
            if not placed:
                continue

        for d in range(len(days)):
            for p in range(periods):
                if timetable[cls][d][p] is None:
                    timetable[cls][d][p] = {"subject":"Free","teacher":""}

    out = {}
    for cls, grid in timetable.items():
        out[cls] = [[f"{cell['subject']}\n({cell['teacher']})" if cell['teacher'] else cell['subject'] for cell in row] for row in grid]
    return {"days": days, "periods_per_day": periods, "grid": out}
