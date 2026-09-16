(function () {
  'use strict';

  function read() {
    return window.SuperAdminData ? window.SuperAdminData.read() : { venues: [], clients: [], users: [], machines: [], payouts: [] };
  }

  function getContext(fallbackName) {
    let context = window.SuperAdminData && window.SuperAdminData.getContext('selectedVenueContext');
    if (!context && fallbackName) context = { venueName: fallbackName };
    const data = read();
    const venue = data.venues.find(item => item.id === context?.venueId || item.name === context?.venueName);
    return {
      ...(context || {}),
      venueId: context?.venueId || venue?.id || '',
      venueName: context?.venueName || venue?.name || fallbackName || '',
      clientId: context?.clientId || venue?.clientId || '',
      orgName: context?.orgName || (data.clients.find(item => item.id === (context?.clientId || venue?.clientId)) || {}).name || ''
    };
  }

  function venueName(venueId, data) {
    return (data || read()).venues.find(item => item.id === venueId)?.name || 'Unassigned venue';
  }

  function payouts(data) {
    const source = data || read();
    return (source.payouts || []).map(item => ({
      ...item,
      venue: item.venue || venueName(item.venueId, source),
      idv: item.idv || (item.kyc === 'Manual' ? 'Manual verification' : item.kyc === 'Pass' ? 'Pass' : 'None'),
      pep: item.pep || (item.risk === 'High' ? (item.idv === 'Pass' ? 'Clear' : 'Hit') : (item.risk === 'Medium' ? 'Pending' : 'Clear')),
      sanctions: item.sanctions || (item.status === 'Rejected' || item.status === 'Failed' ? 'Hit' : 'Clear'),
      cop: item.cop || (item.risk === 'High' ? 'No match' : (item.risk === 'Medium' ? 'Close match' : 'Match')),
      risk: item.risk || 'Low'
    }));
  }

  function scopeByVenue(items, context) {
    if (!context?.venueName) return items;
    return items.filter(item => item.venue === context.venueName || item.venueId === context.venueId);
  }

  window.RiversideAdminData = { read, getContext, venueName, payouts, scopeByVenue };
}());
