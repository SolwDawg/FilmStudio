#!/usr/bin/env node
import { runCli } from "./gflow/cli.js";

const exitCode = await runCli(process.argv);
process.exitCode = exitCode;
