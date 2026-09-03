import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { SearchService } from './search.service';

// Plain @Query() read, no method-scoped pipe — same convention as every
// Story 16.1 list controller (a method-scoped ZodValidationPipe validates
// EVERY handler parameter, not just the body — Story 1.8's Change Log
// records a real bug from that exact combination). No @Roles() here: the
// role-based filtering this story adds happens per-entity-group inside
// SearchService (a single response can contain both role-open and
// role-gated groups), not as an all-or-nothing route guard.
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@CurrentUser() user: AuthUser, @Query('q') q?: string | string[]) {
    // A duplicate `?q=a&q=b` query string is parsed into an array by
    // Nest's underlying query parser — take just the first value rather
    // than forwarding an array where SearchService expects a string.
    const value = Array.isArray(q) ? q[0] : q;
    return this.searchService.search(value ?? '', user.role);
  }
}
