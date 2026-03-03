// ============================================
// COMPONENTES REUTILIZÁVEIS
// ============================================

const Components = {
    // Pill genérico
    pill(text, type = 'default', extraClass = '') {
        const typeClass = {
            'ok': 'ok',
            'bad': 'bad',
            'token': 'token',
            'warn': 'warn'
        }[type] || '';
        
        return `<span class="pill ${typeClass} ${extraClass}">${text}</span>`;
    },

    // Indicador de token
    tokenIndicator(session, patient, token) {
        if (patient?.serviceType !== 'cassems') return '';
        
        if (token?.status === 'enviado') {
            return this.pill(`✅ Token: ${token.code || 'Enviado'}`, 'token');
        } else if (token?.status === 'problema') {
            return this.pill('❌ Problema no token', 'bad');
        } else if (token?.status === 'pendente') {
            return this.pill('⏳ Token pendente', 'warn');
        } else {
            return this.pill('📝 Registrar token', 'warn');
        }
    },

    // Card de sessão
    sessionCard(session, patient, token, photo, actions = true) {
        const tokenIndicator = this.tokenIndicator(session, patient, token);
        const photoHtml = photo ? `<img src="${photo}" class="photo-preview small" style="width:40px; height:40px;" />` : '';
        
        const actionsHtml = actions ? `
            <div class="actions" style="margin-top:10px;">
                <button class="small" onclick="SessionActions.toggleDid('${session.id}')">🔄 Alternar</button>
                <button class="small" onclick="SessionActions.togglePaid('${session.id}')">💰 Pagamento</button>
                <button class="small" onclick="SessionActions.editValue('${session.id}')">✏️ Editar valor</button>
                ${patient?.serviceType === 'cassems' ? 
                    `<button class="small token-btn" onclick="TokenActions.openModal('${session.id}', '${patient.name}', '${session.date}')">🎫 Token</button>` : ''}
                <button class="small danger" onclick="SessionActions.delete('${session.id}')">🗑️ Excluir</button>
            </div>
        ` : '';

        return `
            <div class="item" id="session-${session.id}">
                <div style="display:flex; gap:10px;">
                    ${photoHtml}
                    <div style="flex:1;">
                        <div style="display:flex; justify-content:space-between;">
                            <div>
                                <b>${session.time || "—"} - ${Utils.escapeHtml(patient?.name || "?")}</b>
                                <div class="muted">
                                    ${session.did === "realizou" ? "✅ Realizou" : "❌ Não realizou"}
                                    ${session.just === "justificada" ? "(Justificada)" : session.just === "nao_justificada" ? "(Sem just.)" : ""}
                                </div>
                                <div style="margin-top:5px;">
                                    ${tokenIndicator}
                                </div>
                            </div>
                            <div>
                                ${this.pill(session.paid === "pago" ? "💰 Pago" : "💸 Não pago", session.paid === "pago" ? "ok" : "bad")}
                                ${this.pill(Utils.fmtMoney(session.value))}
                            </div>
                        </div>
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // Card de paciente na lista
    patientFolderCard(patient, stats) {
        const photo = Photos.get(patient.id);
        const photoHtml = photo ? `<img src="${photo}" class="photo-preview small" style="width:50px; height:50px;" />` : '';
        const cassemsIcon = patient.serviceType === 'cassems' ? '🎫' : '';
        const percent = stats.total > 0 ? (stats.realizadas / stats.total) * 100 : 0;
        
        const tokensPaciente = Tokens.countByPatient(patient.id, 'enviado');
        const tokensPendentes = Tokens.countByPatient(patient.id, 'pendente');
        const tokensProblema = Tokens.countByPatient(patient.id, 'problema');
        
        return `
            <div class="item" onclick="PatientActions.openFolder('${patient.id}')" style="cursor:pointer;">
                <div style="display:flex; gap:10px;">
                    ${photoHtml}
                    <div style="flex:1;">
                        <div style="display:flex; justify-content:space-between;">
                            <div>
                                <b>📁 ${Utils.escapeHtml(patient.name)} ${cassemsIcon}</b>
                                <div class="muted">
                                    ${patient.serviceType || "Particular"} • ${stats.total} sessões
                                </div>
                                <div style="display:flex; gap:10px; margin-top:5px; flex-wrap:wrap;">
                                    ${this.pill(`✅ ${stats.realizadas}`, 'ok')}
                                    ${this.pill(`❌ ${stats.faltas}`, 'bad')}
                                    ${patient.serviceType === 'cassems' ? `
                                        ${this.pill(`🎫 ${tokensPaciente}`, 'token')}
                                        ${tokensPendentes > 0 ? this.pill(`⏳ ${tokensPendentes}`, 'warn') : ''}
                                        ${tokensProblema > 0 ? this.pill(`❌ ${tokensProblema}`, 'bad') : ''}
                                    ` : ''}
                                </div>
                                <div class="progress-bar" style="margin-top:5px; width:100%;">
                                    <div class="progress-fill" style="width:${percent}%;"></div>
                                </div>
                            </div>
                            <div>
                                ${stats.debt > 0 ? this.pill(`💰 ${Utils.fmtMoney(stats.debt)}`, 'bad') : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Slot da agenda
    scheduleSlot(day, time, entry, patient, stats) {
        if (!entry) {
            return `<td data-day="${day}" data-time="${time}" class="slotBox slotRed" style="cursor:pointer;">
                <div style="opacity:0.7;">🟥 Vago</div>
                <div class="muted" style="font-size:0.8rem;">Clique para agendar</div>
            </td>`;
        }
        
        const colorClass = SERVICE_COLORS[patient?.serviceType] || "slotPurple";
        const serviceLabel = patient?.serviceType === "cassems" ? "Cassems" :
                            patient?.serviceType === "unimed" ? "Unimed" :
                            patient?.serviceType === "outros" ? "Outros" : "Particular";
        
        const tokenIcon = patient?.serviceType === "cassems" ? '<span class="pill token" style="margin-top:0;">🎫</span>' : '';
        
        const tokensPaciente = Tokens.countByPatient(patient?.id, 'enviado');
        const tokensPendentes = Tokens.countByPatient(patient?.id, 'pendente');
        const tokensProblema = Tokens.countByPatient(patient?.id, 'problema');
        
        return `
            <td data-day="${day}" data-time="${time}" class="slotBox ${colorClass}">
                <div style="font-weight:600;">${Utils.escapeHtml(patient?.name || "?")} ${tokenIcon}</div>
                <div class="muted" style="font-size:0.85rem;">${serviceLabel}</div>
                <div class="slot-counter">
                    <span title="Sessões realizadas">✅ ${stats?.realizadas || 0}</span>
                    <span title="Faltas">❌ ${stats?.faltas || 0}</span>
                    <span title="Total">📊 ${stats?.total || 0}</span>
                </div>
                ${patient?.serviceType === 'cassems' ? `
                    <div class="slot-counter" style="margin-top:5px; justify-content:space-around;">
                        <span class="pill token" style="font-size:0.7rem; background:rgba(232,198,106,0.3);">🎫 Enviados: ${tokensPaciente}</span>
                        ${tokensPendentes > 0 ? `
                            <span class="pill warn" style="font-size:0.7rem;">⏳ Pend: ${tokensPendentes}</span>
                        ` : ''}
                        ${tokensProblema > 0 ? `
                            <span class="pill bad" style="font-size:0.7rem;">❌ Prob: ${tokensProblema}</span>
                        ` : ''}
                    </div>
                ` : ''}
            </td>
        `;
    },

    // Card de token manual
    manualTokenCard(token) {
        const statusClass = token.status === 'enviado' ? 'ok' : (token.status === 'problema' ? 'bad' : 'warn');
        const statusText = token.status === 'enviado' ? '✅ Enviado' : (token.status === 'problema' ? '❌ Problema' : '⏳ Pendente');
        
        return `
            <div class="item" style="padding:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        ${this.pill(statusText, statusClass)}
                        ${token.code ? this.pill(`Cód: ${token.code}`, 'token') : ''}
                        <div class="muted" style="font-size:0.8rem; margin-top:5px;">
                            ${new Date(token.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <select onchange="TokenActions.updateStatus('${token.id}', this.value)" style="min-height:30px; width:120px; padding:4px;">
                            <option value="pendente" ${token.status === 'pendente' ? 'selected' : ''}>⏳ Pendente</option>
                            <option value="enviado" ${token.status === 'enviado' ? 'selected' : ''}>✅ Enviado</option>
                            <option value="problema" ${token.status === 'problema' ? 'selected' : ''}>❌ Problema</option>
                        </select>
                        <button class="small danger" onclick="TokenActions.deleteManual('${token.id}')" style="min-height:30px;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Card de evolução
    evolucaoCard(evolucao) {
        return `
            <div class="timeline-item">
                <div class="timeline-date">📅 ${new Date(evolucao.date).toLocaleDateString()}</div>
                <div class="timeline-content">${Utils.escapeHtml(evolucao.text)}</div>
                <div class="timeline-actions">
                    <button class="small" onclick="EvolucaoActions.openEdit('${evolucao.id}')">✏️</button>
                    <button class="small danger" onclick="EvolucaoActions.delete('${evolucao.id}')">🗑️</button>
                </div>
            </div>
        `;
    },

    // Card de aniversariante
    aniversarianteCard(patient) {
        const photo = Photos.get(patient.id);
        const photoHtml = photo ? `<img src="${photo}" class="photo-preview small" style="width:40px; height:40px;" />` : '';
        
        return `
            <div class="item">
                <div style="display:flex; gap:10px; align-items:center;">
                    ${photoHtml}
                    <div>
                        <b>🎂 ${Utils.escapeHtml(patient.name)}</b>
                        <div class="muted">${new Date(patient.birth).toLocaleDateString("pt-BR")}</div>
                        <button class="small" onclick="PatientActions.sendBirthdayMessage('${patient.id}')">📱 Enviar mensagem</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Card de próximo atendimento
    proximoAtendimentoCard(item) {
        const diasText = item.days === 0 ? "Hoje" : item.days === 1 ? "Amanhã" : `Em ${item.days} dias`;
        
        return `
            <div class="item">
                <b>${Utils.escapeHtml(item.patient)}</b>
                <div class="muted">${item.time} - ${diasText}</div>
            </div>
        `;
    },

    // Card de devedor
    devedorCard(devedor) {
        return `
            <div class="item">
                <b>${Utils.escapeHtml(devedor.name)}</b>
                <div class="muted">${Utils.fmtMoney(devedor.debt)}</div>
            </div>
        `;
    }
};
