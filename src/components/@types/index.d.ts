import type { Image } from '@/components/image';
import type { Color as ColorConstructor } from '@/components/color';

export type Vector2dF = {
    x: number;
    y: number;
};

export type SizeF = {
    width: number;
    height: number;
};

export type RectF = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type ClipboardData = {
    type: 'text' | 'html';
    value: string;
} | {
    type: 'image';
    value: Image;
} | {
    type: 'file-paths';
    value: string[];
} | {
    type: 'none';
    value?: null;
};

export type DragOptions = {
    image: Image;
};

export type Color = ColorConstructor | string;
