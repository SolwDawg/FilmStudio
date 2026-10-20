#!/usr/bin/env node
import { runCli } from "./gflow/index.js";

const exitCode = await runCli(process.argv);
process.exitCode = exitCode;
