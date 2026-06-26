import { useMemo, useState } from "react";
import '../../style/multi-select.css';

type MultiSelectProps<T> = {
  items: T[];
  selected: T[];
  onChange: (next: T[]) => void;

  getId: (item: T) => string | number;
  getLabel: (item: T) => string;

  placeholder?: string;
  label?: string;
  className?: string;
};

export function MultiSelect<T>({items, selected, onChange, getId, getLabel, placeholder = "Cerca...", label, className}: MultiSelectProps<T>) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search) return [];

        const lower = search.toLowerCase();

        return items.filter((item) => {
            const matchesSearch = getLabel(item).toLowerCase().includes(lower);
            
            const isAlreadySelected = selected.some((s) => getId(s) === getId(item));

            return matchesSearch && !isAlreadySelected;
        });
    }, [search, items, getLabel, selected, getId]);

    function add(item: T) {
        const id = getId(item);

        if (selected.some((s) => getId(s) === id)) return;

        onChange([...selected, item]);
        setSearch("");
    }

    function remove(id: string | number) {
        onChange(selected.filter((s) => getId(s) !== id));
    }

    return (
        <div className="msContainer">
        {label && <label>{label}</label>}

        <input
            className={className ?? "filterItem msInput"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
        />

        {/* dropdown suggerimenti */}
        {search && filtered.length > 0 && (
            <div className="msDropdown">
            {filtered.map((item) => {
                const id = getId(item);

                return (
                <button
                    className="msOption"
                    key={id}
                    type="button"
                    onClick={() => add(item)}
                >
                    {getLabel(item)}
                </button>
                );
            })}
            </div>
        )}

        {/* selezionati */}
        <div className="msSelectedContainer">
            {selected.map((item) => {
            const id = getId(item);

            return (
                <span className="msChip" key={id}>
                    {getLabel(item)}

                    <button
                        className="msRemoveBtn"
                        type="button"
                        onClick={() => remove(id)}
                    >
                        &times;
                    </button>
                </span>
            );
            })}
        </div>
    </div>
    );
}