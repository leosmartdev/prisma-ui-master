const newColor = '#ff0000';
const ackWaitColor = '#ffaaaa';

export default class AlertHighlighter {
  constructor(olmap) {
    this.olmap = olmap;
    this.active = new Map();
  }

  add = (notice, lookup) => {
    let nactive = this.active.get(lookup);
    if (!nactive) {
      nactive = new Map();
      this.active.set(lookup, nactive);
    }
    nactive.set(notice.noticeId, notice);
    return this.colorFor(nactive);
  };

  remove = (notice, lookup) => {
    const nactive = this.active.get(lookup);
    if (nactive) {
      nactive.delete(notice.noticeId);
      if (nactive.size === 0) {
        this.active.delete(lookup);
        return null;
      }
      return this.colorFor(nactive);
    }
    return null;
  };

  colorFor = nactive => {
    let color = null;
    nactive.forEach(notice => {
      if (notice.action === 'NEW') {
        color = newColor;
        return false;
      }
      if (notice.action === 'ACK_WAIT') {
        color = ackWaitColor;
      }
    });
    return color;
  };

  update = notice => {
    const t = notice.action;
    if (t !== 'NEW' && t !== 'ACK' && t !== 'ACK_WAIT' && t !== 'CLEAR') {
      return;
    }
    if (this.olmap && notice.target) {
      const lookup = notice.target.registryId || notice.target.trackId;
      if (t === 'NEW') {
        const color = this.add(notice, lookup);
        this.olmap.addProperty(lookup, 'priorityColor', color);
      } else if (t === 'ACK_WAIT') {
        const color = this.add(notice, lookup);
        this.olmap.addProperty(lookup, 'priorityColor', color);
      } else {
        const color = this.remove(notice, lookup);
        if (color === null) {
          this.olmap.removeProperty(lookup, 'priorityColor');
        } else {
          this.olmap.addProperty(lookup, 'priorityColor', color);
        }
      }
    }
  };
}
