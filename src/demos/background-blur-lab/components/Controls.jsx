import { MODELS } from '../config.js';
import { PRESETS } from '../backgrounds.js';

function Segmented({ name, value, options, onChange }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map(([v, label]) => (
        <label key={v}>
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

function Slider({ id, label, value, min, max, step, format, onChange }) {
  return (
    <div className="slider">
      <div className="top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

const px = (v) => `${v} px`;
const fixed2 = (v) => v.toFixed(2);

export default function Controls({ settings, update, backgrounds, customBg, onCustomBg, isCamera }) {
  return (
    <aside aria-label="Effect controls">
      <fieldset>
        <legend>Effect</legend>
        <Segmented
          name="effect"
          value={settings.effect}
          options={[['blur', 'Blur'], ['replace', 'Replace'], ['none', 'Off'], ['mask', 'Mask']]}
          onChange={(effect) => update({ effect })}
        />
      </fieldset>

      {settings.effect === 'blur' && (
        <Slider id="blur" label="Blur strength" value={settings.blur} min={2} max={40} step={1} format={px}
          onChange={(blur) => update({ blur })} />
      )}

      {settings.effect === 'replace' && (
        <fieldset>
          <legend>Background</legend>
          <div className="swatches">
            {PRESETS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className="swatch"
                aria-label={label}
                title={label}
                aria-pressed={settings.bg === key}
                style={{ backgroundImage: `url(${backgrounds[key].thumb})` }}
                onClick={() => update({ bg: key })}
              />
            ))}
            <label
              className={`swatch upload ${customBg ? 'has-image' : ''}`}
              data-selected={settings.bg === 'custom'}
              title="Use your own image"
              style={customBg ? { backgroundImage: `url(${customBg.url})` } : undefined}
              onClick={(e) => {
                // Re-select an already uploaded image instead of reopening the picker.
                if (customBg && settings.bg !== 'custom') {
                  e.preventDefault();
                  update({ bg: 'custom' });
                }
              }}
            >
              {!customBg && '+ Image'}
              <input
                className="sr"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  onCustomBg(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend>Mask refinement</legend>
        <Slider id="soft" label="Edge softness" value={settings.soft} min={0.02} max={0.5} step={0.01} format={fixed2}
          onChange={(soft) => update({ soft })} />
        <Slider id="feather" label="Edge feather" value={settings.feather} min={0} max={12} step={1} format={px}
          onChange={(feather) => update({ feather })} />
        <Slider id="smooth" label="Temporal smoothing" value={settings.smooth} min={0} max={0.9} step={0.05} format={fixed2}
          onChange={(smooth) => update({ smooth })} />
      </fieldset>

      <fieldset>
        <legend>Model</legend>
        <Segmented
          name="model"
          value={settings.model}
          options={Object.entries(MODELS).map(([key, m]) => [key, m.label])}
          onChange={(model) => update({ model })}
        />
        <Segmented
          name="delegate"
          value={settings.delegate}
          options={[['GPU', 'GPU'], ['CPU', 'CPU (WASM)']]}
          onChange={(delegate) => update({ delegate })}
        />
      </fieldset>

      <label className={`check ${isCamera ? '' : 'is-dim'}`}>
        <input type="checkbox" checked={settings.mirror} onChange={(e) => update({ mirror: e.target.checked })} />
        Mirror camera
      </label>
    </aside>
  );
}
