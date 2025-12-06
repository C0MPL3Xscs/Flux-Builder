import React from 'react';

const PropertiesPanel = ({ shape, onChange }) => {
    if (!shape) return null;

    const handleChange = (key, value) => {
        onChange({ ...shape, [key]: value });
    };

    return (
        <div
            className="absolute top-24 right-8 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-2xl p-6 w-72 shadow-2xl z-50 text-white"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-xs font-bold mb-6 text-white/60 uppercase tracking-widest border-b border-white/10 pb-3">Style</h3>

            {/* Background Color */}
            <div className="mb-6">
                <label className="block text-xs font-semibold text-white/80 mb-3">Background</label>
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-inner">
                        <input
                            type="color"
                            value={shape.backgroundColor && shape.backgroundColor !== 'transparent' ? shape.backgroundColor : '#ffffff'}
                            onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-none cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={() => handleChange('backgroundColor', 'transparent')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 border ${shape.backgroundColor === 'transparent' ? 'bg-white/20 border-white/40 text-white' : 'bg-transparent border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                        Transparent
                    </button>
                </div>
            </div>

            {/* Stroke Color */}
            <div className="mb-6">
                <label className="block text-xs font-semibold text-white/80 mb-3">Stroke</label>
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-inner">
                        <input
                            type="color"
                            value={shape.strokeColor || '#ffffff'}
                            onChange={(e) => handleChange('strokeColor', e.target.value)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-none cursor-pointer"
                        />
                    </div>
                    <span className="text-xs text-white/50">{shape.strokeColor || '#ffffff'}</span>
                </div>
            </div>

            {/* Stroke Width */}
            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-white/80">Stroke Width</label>
                    <span className="text-xs text-white/50">{shape.strokeWidth || 2}px</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={shape.strokeWidth || 2}
                    onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
                    className="w-full appearance-none bg-white/10 h-1.5 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                />
            </div>

            {/* Opacity */}
            <div className="mb-2">
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-white/80">Opacity</label>
                    <span className="text-xs text-white/50">{Math.round((shape.opacity || 1) * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={shape.opacity !== undefined ? shape.opacity : 1}
                    onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                    className="w-full appearance-none bg-white/10 h-1.5 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                />
            </div>

            {/* Text Styling */}
            <div className="mb-2 border-t border-white/10 pt-4 mt-4">
                <h4 className="text-xs font-bold mb-4 text-white/60 uppercase tracking-widest">Text</h4>

                {/* Text Color */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-white/80 mb-2">Color</label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-inner">
                            <input
                                type="color"
                                value={shape.textColor || '#ffffff'}
                                onChange={(e) => handleChange('textColor', e.target.value)}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Font Family */}
                <div className="mb-2">
                    <label className="block text-xs font-semibold text-white/80 mb-2">Font</label>
                    <select
                        value={shape.fontFamily || 'cursive'}
                        onChange={(e) => handleChange('fontFamily', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                    >
                        <option value="cursive" className="text-black">Handwritten</option>
                        <option value="sans-serif" className="text-black">Sans Serif</option>
                        <option value="serif" className="text-black">Serif</option>
                        <option value="monospace" className="text-black">Monospace</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PropertiesPanel;
