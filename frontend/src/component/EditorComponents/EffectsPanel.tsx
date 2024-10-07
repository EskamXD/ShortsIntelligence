import React from "react";
import { Button } from "react-bootstrap";
import RemoveIcon from "@mui/icons-material/Remove";

interface EffectsPanelProps {
    onApplyEffect: (effect: string) => void;
    activeEffects: string[];
    onRemoveEffect: (effect: string) => void;
}

const EffectsPanel: React.FC<EffectsPanelProps> = ({
    onApplyEffect,
    activeEffects,
    onRemoveEffect,
}) => {
    const availableEffects = ["Grayscale", "Sepia", "Invert"];

    return (
        <div className="effects-panel">
            <h3>Effects</h3>
            <div
                className="d-flex flex-column gap-3"
                style={{ margin: "0 auto" }}>
                {availableEffects.map((effect) => (
                    <Button
                        key={effect}
                        variant="light"
                        onClick={() => onApplyEffect(effect)}
                        disabled={activeEffects.includes(effect)}>
                        {effect}
                    </Button>
                ))}
            </div>
            {activeEffects.length !== 0 && (
                <>
                    <h4 className="mt-3">Active Effects</h4>
                    <div
                        className="d-flex flex-column gap-3"
                        style={{ margin: "0 auto" }}>
                        {activeEffects.map((effect) => (
                            <div key={effect} className="d-flex space-between">
                                {effect}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onRemoveEffect(effect)}>
                                    <RemoveIcon />
                                </Button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default EffectsPanel;
