import { DotenvParseOutput } from 'dotenv';

export type Path = string;
export type LoadConfig = (path: Path) => Promise<DotenvParseOutput>;
export type CheckConfigFile = (path: Path) => void;
