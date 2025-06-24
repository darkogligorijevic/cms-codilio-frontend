// lib/page-utils.ts - Utility functions for page operations
import type { Page } from '@/lib/types';

/**
 * Filters pages to get only root pages (pages without parent)
 */
export function getRootPages(pages: Page[]): Page[] {
  return pages.filter(page => !page.parentId);
}

/**
 * Checks if a page has children
 */
export function hasChildren(page: Page): boolean {
  return !!(page.children && page.children.length > 0);
}

/**
 * Flattens hierarchical pages into a single array
 */
export function flattenPages(pages: Page[]): Page[] {
  const result: Page[] = [];
  
  function flatten(pageList: Page[]) {
    pageList.forEach(page => {
      result.push(page);
      if (page.children && page.children.length > 0) {
        flatten(page.children);
      }
    });
  }
  
  flatten(pages);
  return result;
}

/**
 * Builds a hierarchical structure from flat pages array
 */
export function buildHierarchy(pages: Page[]): Page[] {
  const pageMap = new Map<number, Page>();
  const rootPages: Page[] = [];
  
  // Create a map of all pages
  pages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] });
  });
  
  // Build the hierarchy
  pages.forEach(page => {
    const pageWithChildren = pageMap.get(page.id)!;
    
    if (page.parentId) {
      const parent = pageMap.get(page.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(pageWithChildren);
      }
    } else {
      rootPages.push(pageWithChildren);
    }
  });
  
  return rootPages;
}

/**
 * Gets all descendant page IDs for a given page
 */
export function getDescendantIds(page: Page): number[] {
  const descendants: number[] = [];
  
  function collectDescendants(currentPage: Page) {
    if (currentPage.children && currentPage.children.length > 0) {
      currentPage.children.forEach(child => {
        descendants.push(child.id);
        collectDescendants(child);
      });
    }
  }
  
  collectDescendants(page);
  return descendants;
}

/**
 * Checks if a page is a descendant of another page
 */
export function isDescendantOf(childPage: Page, potentialParent: Page): boolean {
  const descendantIds = getDescendantIds(potentialParent);
  return descendantIds.includes(childPage.id);
}

/**
 * Gets the depth level of a page in the hierarchy
 */
export function getPageDepth(page: Page, allPages: Page[]): number {
  let depth = 0;
  let currentParentId = page.parentId;
  
  while (currentParentId) {
    depth++;
    const parent = allPages.find(p => p.id === currentParentId);
    currentParentId = parent?.parentId;
  }
  
  return depth;
}

/**
 * Sorts pages by hierarchy (parents first, then children)
 */
export function sortPagesByHierarchy(pages: Page[]): Page[] {
  return pages.sort((a, b) => {
    // Parents come before children
    if (!a.parentId && b.parentId) return -1;
    if (a.parentId && !b.parentId) return 1;
    
    // If both are at the same level, sort by sortOrder
    if ((!a.parentId && !b.parentId) || (a.parentId === b.parentId)) {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    }
    
    return 0;
  });
}