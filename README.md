proxy server for Lauinger IT Solutions
===

Running IPv6-only servers comes with connectivity problems for people without native IPv6-addresses. As currently public infrastructure with 
IPv4-only capabilities exist, this needs to be fixed.

Even tunneling mechanisms, such as Teredo or 6in4, won't work as some browsers (e.g. Chromium) do not recognise a missing A record for a given 
domain name, which should make them use IPv6. Instead, the system wide preference of IPv6 > IPv4 > IPv6-tunnels is applied. On top of that, it 
is not possible to force customers into using (and possibly even installing) tunneling software.

Lauinger IT Solutions provides this proxy server on proxy.lauinger-it:80. All IPv6-only domains get an A record to this server in addition to 
their AAAA-records. If a user wants to browse to one of the sites, he ends up at proxy.lauinger-it.de which then fetches the site using an 
IPv6 connection and sends it back to the user.

This proxy server is written in simple node.js without any additional packages.
