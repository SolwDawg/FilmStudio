#!/usr/bin/env node
import { runStudioCli } from "./cli.js";

const exitCode = await runStudioCli(process.argv);
process.exitCode = exitCode;
