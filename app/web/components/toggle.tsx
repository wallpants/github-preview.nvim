type Props = {
    checked: boolean;
    onChange: (v: boolean) => void;
    className?: string;
};

export const Toggle = ({ checked, onChange }: Props) => (
    <label className="relative inline-flex cursor-pointer items-center">
        <input
            type="checkbox"
            value=""
            className="peer sr-only"
            checked={checked}
            onChange={(e) => {
                onChange(e.target.checked);
            }}
        />
        {/* eslint-disable-next-line */}
        <div className="peer-checked:bg-github-success-fg peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
    </label>
);
