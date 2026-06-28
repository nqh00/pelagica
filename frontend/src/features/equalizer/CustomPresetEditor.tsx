import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
    CUSTOM_PRESET_GAIN_MAX,
    CUSTOM_PRESET_GAIN_MIN,
    EQUALIZER_BAND_KEYS,
    EQUALIZER_BAND_TEMPLATE,
    type CustomEqualizerPreset,
} from './presets';

interface CustomPresetEditorProps {
    preset: CustomEqualizerPreset;
    onChange: (preset: CustomEqualizerPreset) => void;
    onSave: () => void;
    onCancel: () => void;
}

const CustomPresetEditor = ({ preset, onChange, onSave, onCancel }: CustomPresetEditorProps) => {
    const { t } = useTranslation('player');

    const updateBandGain = (index: number, gain: number) => {
        const bands = preset.bands.map((band, bandIndex) =>
            bandIndex === index ? { ...band, gain } : band
        );
        onChange({ ...preset, bands });
    };

    const canSave = preset.name.trim().length > 0;

    return (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-medium">{t('customPresetEditor')}</p>
                <p className="text-xs text-muted-foreground">{t('customPresetLivePreview')}</p>
            </div>
            <Input
                value={preset.name}
                onChange={(event) => onChange({ ...preset, name: event.target.value })}
                placeholder={t('customPresetNamePlaceholder')}
                aria-label={t('customPresetName')}
            />

            <div className="space-y-3">
                {EQUALIZER_BAND_KEYS.map((key, index) => {
                    const template = EQUALIZER_BAND_TEMPLATE[index]!;
                    const band = preset.bands[index] ?? template;

                    return (
                        <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                    {t(`equalizerBands.${key}`)} ({template.frequency} Hz)
                                </span>
                                <span className="tabular-nums">
                                    {band.gain > 0 ? '+' : ''}
                                    {Math.round(band.gain)} dB
                                </span>
                            </div>
                            <Slider
                                min={CUSTOM_PRESET_GAIN_MIN}
                                max={CUSTOM_PRESET_GAIN_MAX}
                                step={1}
                                value={[band.gain]}
                                onValueChange={(value) => updateBandGain(index, value[0] ?? 0)}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                    {t('customPresetCancel')}
                </Button>
                <Button size="sm" onClick={onSave} disabled={!canSave}>
                    {t('customPresetSave')}
                </Button>
            </div>
        </div>
    );
};

export default CustomPresetEditor;
