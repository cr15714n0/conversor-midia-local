import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
import { Elysia } from "elysia";
import { BaseHtml } from "../components/base";
import { Header } from "../components/header";
import db from "../db/db";
import { Filename, Jobs } from "../db/types";
import { ALLOW_UNAUTHENTICATED, HIDE_HISTORY, LANGUAGE, TIMEZONE, WEBROOT, BRANDING, } from "../helpers/env";
import { userService } from "./user";
import { EyeIcon } from "../icons/eye";
import { DeleteIcon } from "../icons/delete";
export const history = new Elysia().use(userService).get("/history", async ({ redirect, user }) => {
    if (HIDE_HISTORY) {
        return redirect(`${WEBROOT}/`, 302);
    }
    let userJobs = db.query("SELECT * FROM jobs ORDER BY id DESC").as(Jobs).all();
    for (const job of userJobs) {
        const files = db.query("SELECT * FROM file_names WHERE job_id = ?").as(Filename).all(job.id);
        job.finished_files = files.length;
        job.files_detailed = files;
    }
    // Filter out jobs with no files
    userJobs = userJobs.filter((job) => job.num_files > 0);
    return (_jsx(BaseHtml, { webroot: WEBROOT, title: "ConvertX | Results", children: _jsxs(_Fragment, { children: [_jsx(Header, { webroot: WEBROOT, branding: BRANDING, allowUnauthenticated: ALLOW_UNAUTHENTICATED, hideHistory: HIDE_HISTORY, loggedIn: true }), _jsx("main", { class: `
              w-full flex-1 px-2
              sm:px-4
            `, children: _jsxs("article", { class: "article", children: [_jsxs("div", { class: "mb-4 flex items-center justify-between", children: [_jsx("h1", { class: "text-xl", children: "Results" }), _jsx("div", { id: "delete-selected-container", children: _jsxs("button", { id: "delete-selected-btn", class: `
                      flex btn-secondary flex-row gap-2 text-contrast
                      disabled:cursor-not-allowed disabled:opacity-50
                    `, disabled: true, children: [_jsx(DeleteIcon, {}), " ", _jsxs("span", { children: ["Delete Selected (", _jsx("span", { id: "selected-count", children: "0" }), ")"] })] }) })] }), _jsxs("table", { class: `
                  w-full table-auto overflow-y-auto rounded-sm bg-neutral-900 text-left
                  [&_td]:p-4
                  [&_tr]:rounded-sm [&_tr]:border-b [&_tr]:border-neutral-800
                `, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { class: `
                        p-2
                        sm:px-4
                      `, children: _jsx("input", { type: "checkbox", id: "select-all", class: "size-4 cursor-pointer", title: "Select all" }) }), _jsx("th", { class: `
                        p-2
                        sm:px-4
                      `, children: _jsx("span", { class: "sr-only", children: "Expand details" }) }), _jsx("th", { class: `
                        p-2
                        sm:px-4
                      `, children: "Time" }), _jsx("th", { class: `
                        p-2
                        sm:px-4
                      `, children: "Files" }), _jsx("th", { class: `
                        p-2
                        max-sm:hidden
                        sm:px-4
                      `, children: "Files Done" }), _jsx("th", { class: `
                        p-2
                        sm:px-4
                      `, children: "Status" }), _jsx("th", { class: `
                        p-2
                        sm:px-4
                      `, children: "Actions" })] }) }), _jsx("tbody", { children: userJobs.map((job) => (_jsxs(_Fragment, { children: [_jsxs("tr", { id: `job-row-${job.id}`, children: [_jsx("td", { children: _jsx("input", { type: "checkbox", class: "size-4 cursor-pointer", "data-checkbox-type": "job", "data-job-id": job.id }) }), _jsx("td", { class: "job-details-toggle cursor-pointer", "data-job-id": job.id, children: _jsx("svg", { id: `arrow-${job.id}`, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "stroke-width": "1.5", stroke: "currentColor", class: "inline-block size-4", children: _jsx("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M8.25 4.5l7.5 7.5-7.5 7.5" }) }) }), _jsx("td", { safe: true, children: new Date(job.date_created).toLocaleTimeString(LANGUAGE, {
                                                                timeZone: TIMEZONE,
                                                            }) }), _jsx("td", { children: job.num_files }), _jsx("td", { class: "max-sm:hidden", children: job.finished_files }), _jsx("td", { safe: true, children: job.status }), _jsxs("td", { class: "flex flex-row gap-4", children: [_jsx("a", { class: `
                              text-accent-500 underline
                              hover:text-accent-400
                            `, href: `${WEBROOT}/results/${job.id}`, children: _jsx(EyeIcon, {}) }), _jsx("form", { action: `${WEBROOT}/delete/${job.id}`, method: "POST", class: "inline", children: _jsx("button", { type: "submit", class: `
                                text-accent-500 underline
                                hover:text-accent-400
                              `, children: _jsx(DeleteIcon, {}) }) })] })] }), _jsx("tr", { id: `details-${job.id}`, class: "hidden", children: _jsx("td", { colspan: "7", children: _jsxs("div", { class: "p-2 text-sm text-neutral-500", children: [_jsx("div", { class: "mb-1 font-semibold", children: "Detailed File Information:" }), job.files_detailed.map((file) => (_jsxs("div", { class: "flex items-center", children: [_jsx("span", { class: "w-5/12 truncate", title: file.file_name, safe: true, children: file.file_name }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", class: `mx-2 inline-block size-4 text-neutral-500`, children: _jsx("path", { "fill-rule": "evenodd", d: "M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z", "clip-rule": "evenodd" }) }), _jsx("span", { class: "w-5/12 truncate", title: file.output_file_name, safe: true, children: file.output_file_name })] })))] }) }) })] }))) })] })] }) }), _jsx("script", { children: `
              document.addEventListener('DOMContentLoaded', () => {
                // Expand/collapse job details
                const toggles = document.querySelectorAll('.job-details-toggle');
                toggles.forEach(toggle => {
                  toggle.addEventListener('click', function() {
                    const jobId = this.dataset.jobId;
                    const detailsRow = document.getElementById(\`details-\${jobId}\`);
                    const arrow = document.getElementById(\`arrow-\${jobId}\`);

                    if (detailsRow && arrow) {
                      detailsRow.classList.toggle("hidden");
                      if (detailsRow.classList.contains("hidden")) {
                        arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />';
                      } else {
                        arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />';
                      }
                    }
                  });
                });

                // Checkbox management
                const selectAllCheckbox = document.getElementById('select-all');
                const jobCheckboxes = document.querySelectorAll('[data-checkbox-type="job"]');
                const deleteSelectedBtn = document.getElementById('delete-selected-btn');
                const deleteSelectedContainer = document.getElementById('delete-selected-container');
                const selectedCountSpan = document.getElementById('selected-count');

                function updateDeleteButton() {
                  const checkedBoxes = Array.from(jobCheckboxes).filter(cb => cb.checked);
                  if (checkedBoxes.length > 0) {
                    deleteSelectedBtn.disabled = false;
                    selectedCountSpan.textContent = checkedBoxes.length;
                  } else {
                    deleteSelectedBtn.disabled = true;
                    selectedCountSpan.textContent = '0';
                  }
                }

                selectAllCheckbox?.addEventListener('change', function() {
                  jobCheckboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                  });
                  updateDeleteButton();
                });

                jobCheckboxes.forEach(checkbox => {
                  checkbox.addEventListener('change', function() {
                    const allChecked = Array.from(jobCheckboxes).every(cb => cb.checked);
                    const someChecked = Array.from(jobCheckboxes).some(cb => cb.checked);
                    if (selectAllCheckbox) {
                      selectAllCheckbox.checked = allChecked;
                      selectAllCheckbox.indeterminate = someChecked && !allChecked;
                    }
                    updateDeleteButton();
                  });
                });

                deleteSelectedBtn?.addEventListener('click', async function() {
                  const checkedBoxes = Array.from(jobCheckboxes).filter(cb => cb.checked);
                  const jobIds = checkedBoxes.map(cb => cb.dataset.jobId);

                  if (jobIds.length === 0) return;

                  const confirmed = confirm(\`Are you sure you want to delete \${jobIds.length} job(s)? This action cannot be undone.\`);
                  if (!confirmed) return;

                  try {
                    const response = await fetch('${WEBROOT}/delete-multiple', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ jobIds }),
                    });

                    if (!response.ok) {
                      throw new Error(\`HTTP error! status: \${response.status}\`);
                    }

                    const result = await response.json();

                    if (result.success || result.deleted > 0) {
                      alert(\`Successfully deleted \${result.deleted} job(s).\${result.failed > 0 ? \` Failed to delete \${result.failed} job(s).\` : ''}\`);
                      window.location.reload();
                    } else {
                      alert('Failed to delete jobs. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error deleting jobs:', error);
                    alert('An error occurred while deleting jobs. Please try again.');
                  }
                });
              });
            ` })] }) }));
}, {
    auth: true,
});
