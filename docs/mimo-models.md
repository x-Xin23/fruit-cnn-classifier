﻿# Model and Rate Limit

This page lists all the models currently supported by the Xiaomi MiMo API Open Platform, including model capabilities, length limits, and rate-limiting quotas, to help you select the appropriate model based on your usage scenario. 

### Rate Limiting Instructions

The platform sets a model concurrency limit for each account. When the server load is high, response delays or ` 429 ` error may occur. We recommend that you reasonably plan your request frequency and implement request retry and backoff strategies in high-concurrency scenarios to avoid triggering rate limits. 

<div className='mdx-highlight'>

- **RPM (Requests Per Minute)**: The maximum number of requests initiated per minute. The calculation scope is the sum of the total number of requests from all API Keys under a single account when calling the same model.
- **TPM (Tokens Per Minute)**: The maximum number of Tokens that can be interacted with per minute. The calculation scope is the sum of the total number of requested Tokens for all API Keys under a single account when calling the same model.

</div>

### Text Generation Model

<table>
<colgroup>
<col style="width: 100px" />
<col style="width: 214px" />
<col style="width: 214px" />
<col style="width: 214px" />
<col style="width: 156px" />
</colgroup>
<thead>
<tr>
<th>**Model Series**</th>
<th>**Model ID (Model ID)**</th>
<th>**Capability Support**</th>
<th>**Length Limit (token)**</th>
<th>**Rate Limiting**</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="2">**Pro Series**</td>
<td>`mimo-v2.5-pro`</td>
<td rowspan="2">Text Generation<br />Deep Thinking<br />Streaming Output<br />Function Call<br />Structured Output<br />Web Search</td>
<td rowspan="2">Context Window: 1M<br />Maximum Output: 128K</td>
<td rowspan="5">Maximum RPM: 100<br />Maximum TPM: 10M</td>
</tr>
<tr>
<td>`mimo-v2-pro`</td>
</tr>
<tr>
<td rowspan="2">**Omni Series**</td>
<td>`mimo-v2.5`</td>
<td rowspan="2">Text Generation<br />Full-modal Understanding<br />Deep Thinking<br />Streaming Output<br />Function Call<br />Structured Output<br />Web Search</td>
<td>Context Window: 1M<br />Maximum Output: 128K</td>
</tr>
<tr>
<td>`mimo-v2-omni`</td>
<td>Context Window: 256K<br />Maximum Output: 128K</td>
</tr>
<tr>
<td>**Flash Series**</td>
<td>`mimo-v2-flash`</td>
<td>Text Generation<br />Deep Thinking<br />Streaming Output<br />Function Call<br />Structured Output<br />Web Search</td>
<td>Context Window: 256K<br />Maximum Output: 64K</td>
</tr>
</tbody>
</table>

### Text-to-Speech (TTS) Model

<table>
<colgroup>
<col style="width: 273px" />
<col style="width: 219px" />
<col style="width: 171px" />
<col style="width: 156px" />
</colgroup>
<thead>
<tr>
<th>**Model ID (Model ID)**</th>
<th>**Capability Support**</th>
<th>**Length Limit (token)**</th>
<th>**Rate Limiting**</th>
</tr>
</thead>
<tbody>
<tr>
<td>`mimo-v2.5-tts`</td>
<td>Speech Synthesis</td>
<td rowspan="4">Context Window: 8K<br />Maximum Output: 8K</td>
<td rowspan="4">Maximum RPM: 100<br />Maximum TPM: 10M</td>
</tr>
<tr>
<td>`mimo-v2.5-tts-voiceclone`</td>
<td>Speech Synthesis<br />Timbre Cloning</td>
</tr>
<tr>
<td>`mimo-v2.5-tts-voicedesign`</td>
<td>Speech Synthesis<br />Timbre Design</td>
</tr>
<tr>
<td>`mimo-v2-tts`</td>
<td>Speech Synthesis</td>
</tr>
</tbody>
</table>

### Quick Selection Guide

<table>
<colgroup>
<col style="width: 350px" />
<col style="width: 350px" />
</colgroup>
<thead>
<tr>
<th>Requirement Scenario</th>
<th>Recommendation Model</th>
</tr>
</thead>
<tbody>
<tr>
<td>Complex reasoning, in-depth analysis, long document processing</td>
<td>`mimo-v2.5-pro`</td>
</tr>
<tr>
<td>Understanding of image, audio, and video content</td>
<td>`mimo-v2.5` or `mimo-v2-omni`</td>
</tr>
<tr>
<td>High concurrency, low cost, and fast response</td>
<td>`mimo-v2-flash`</td>
</tr>
<tr>
<td>Text-to-Speech (Standard Preset Voice)</td>
<td>`mimo-v2.5-tts`</td>
</tr>
<tr>
<td>Voice Cloning (Upload Audio Sample)</td>
<td>`mimo-v2.5-tts-voiceclone`</td>
</tr>
<tr>
<td>Customized Tone Design</td>
<td>`mimo-v2.5-tts-voicedesign`</td>
</tr>
</tbody>
</table>

